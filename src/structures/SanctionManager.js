import fsSync, { promises as fs } from 'fs';
import path from 'path';
import { Permissions } from 'discord.js';
import moment from 'moment';
import { db, client } from '../main';
import { prunePseudo } from '../utils';
import ACTION_TYPE from './actions/actionType';

class SanctionManager {
  static async getOrCreateChannel(data) {
    const pseudo = prunePseudo(data.member, data.user, data.victimId);
    const channelName = `${client.config.moderation.banChannelPrefix}${pseudo}`;

    const filter = c => c.type === 'text' && (c.name === channelName || c.topic?.split(' ')[0] === data.victimId);
    if (client.guild.channels.cache.some(filter)) {
      return client.guild.channels.cache.find(filter);
    }

    try {
      const channel = await client.guild.channels.create(
        channelName,
        {
          type: 'text',
          topic: `${data.victimId} (NE PAS CHANGER)`,
          parent: client.config.moderation.logCategory,
          permissionOverwrites: [{
            id: client.config.roles.everyone,
            deny: [Permissions.FLAGS.VIEW_CHANNEL, Permissions.FLAGS.CREATE_INSTANT_INVITE],
          }, {
            id: client.config.roles.staff,
            allow: [Permissions.FLAGS.VIEW_CHANNEL, Permissions.FLAGS.MANAGE_CHANNELS],
          }, {
            id: data.victimId,
            allow: [Permissions.FLAGS.VIEW_CHANNEL],
          }],
        },
      );
      return channel;
    } catch (err) {
      data.messageChannel.send(client.config.messages.errors.channelPermissions);
      client.logger.warn('Swan does not have sufficient permissions to edit a TextChannel permissions');
      client.logger.debug(`    ↳ ${err.message}`);
    }
  }

  static async removeChannel(data) {
    const channelName = `${client.config.moderation.banChannelPrefix}${prunePseudo(data.member, data.user, data.victimId)}`;
    const filter = c => c.type === 'text' && (c.name === channelName || c.topic?.split(' ')[0] === data.victimId);
    const chan = client.guild.channels.cache.find(filter);
    let file;

    if (chan) {
      const allMessages = await SanctionManager.getAllMessages(chan);
      file = await SanctionManager.getMessageHistoryFile(data, allMessages);
      chan.delete();
    }
    return file;
  }

  static async addRole(data, overwrite = false) {
    const role = data.type === ACTION_TYPE.BAN
      ? client.guild.roles.resolve(client.config.roles.ban)
      : client.guild.roles.resolve(client.config.roles.mute);

    try {
      if (overwrite) await data.member.roles.set([role]);
      else await data.member.roles.add(role);
    } catch (err) {
      data.messageChannel.send(client.config.messages.errors.rolePermissions);
      client.logger.warn('Swan does not have sufficient permissions to edit GuildMember roles');
      client.logger.debug(`    ↳ ${err.message}`);
    }
  }

  static async removeRole(data) {
    // On enlève le rôle de la victime
    const role = data.type === ACTION_TYPE.UNBAN
      ? client.guild.roles.resolve(client.config.roles.ban)
      : client.guild.roles.resolve(client.config.roles.mute);

    if (data.member?.roles.cache.has(role.id)) {
      try {
        data.member.roles.remove(role);
      } catch (err) {
        data.messageChannel.send(client.config.messages.errors.rolePermissions);
        client.logger.warn('Swan does not have sufficient permissions to edit GuildMember roles');
        client.logger.debug(`    ↳ ${err.message}`);
      }
    }
  }

  static async getAllMessages(chan) {
    const allMessagesMapped = await chan.messages.fetch().catch(console.error) || [];
    const allMessages = [];
    for (const elt of allMessagesMapped) {
      const infos = elt[1];
      allMessages.push({
        id: infos.id,
        content: infos.content,
        authorName: infos.author.username,
        sentAt: infos.createdTimestamp,
        edited: !!infos.editedTimestamp,
      });
    }
    allMessages.sort((a, b) => a.sentAt - b.sentAt);

    return allMessages;
  }

  static async getMessageHistoryFile(data, messages) {
    let fileContent = `Historique des messages du salon du banni : ${data.getUserName()}.\n\n\nMessages :\n\n`;

    for (const message of messages) {
      const sentAt = moment(new Date(message.sentAt)).format('[à] HH:mm:ss [le] DD/MM/YY');

      let line = `[${message.id}] (${sentAt}) ${message.authorName} : ${message.content}`;
      if (message.edited) line = `[Modifié] ${line}`;
      fileContent += `${line}\n`;
    }

    let fileName = `logs-${data.user.id}`;
    const filePath = path.join(process.cwd(), 'databases', 'ban-logs/');
    let i = 1;
    if (fsSync.existsSync(`${filePath}${fileName}.txt`)) {
      while (fsSync.existsSync(`${filePath}${fileName}-${i}.txt`)) {
        i++;
      }
      fileName += `-${i}`;
    }

    const createFile = async () => {
      try {
        await fs.writeFile(`${filePath}${fileName}.txt`, fileContent);
      } catch (e) {
        if (e.code === 'ENOENT') {
          await fs.mkdir(filePath);
          await createFile();
        }
      }
    };
    await createFile();

    return {
      path: `${filePath}${fileName}.txt`,
      name: fileName,
    };
  }

  static async isBanned(id, orHardban = false) {
    const query = orHardban
      ? {
        member: id,
        $or: [{ type: ACTION_TYPE.BAN }, { type: ACTION_TYPE.HARDBAN }],
      }
      : {
        member: id,
        type: ACTION_TYPE.BAN,
      };
    const doc = await db.sanctions.findOne(query).catch(console.error);
    return !!doc;
  }

  static async isMuted(id) {
    const doc = await db.sanctions.findOne({ member: id, type: ACTION_TYPE.MUTE }).catch(console.error);
    return !!doc;
  }

  static async hasSentMessages(id) {
    const history = await db.sanctionsHistory.findOne({ memberId: id }).catch(console.error);
    db.sanctions.update({ member: id, type: ACTION_TYPE.BAN, id: history.lastBanId }, { $set: { hasSentMessages: true } }).catch(console.error);
  }
}

export default SanctionManager;

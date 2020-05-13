/* eslint-disable import/no-cycle */
import fs from 'fs';
import moment from 'moment';
import { db, config, client, logger } from '../main';
import { prunePseudo } from '../utils';
import ACTION_TYPE from './actions/actionType';
import UnbanAction from './actions/UnbanAction';
import BanAction from './actions/BanAction';
import UnmuteAction from './actions/UnmuteAction';
import ModerationData from './ModerationData';
import RemoveWarnAction from './actions/RemoveWarnAction';

class SanctionManager {
  static async getOrCreateChannel(data) {
    const pseudo = prunePseudo(data.member);
    const channelName = `${config.moderation.banChannelPrefix}${pseudo}`;

    const filter = c => c.type === 'text' && (c.name === channelName || c.topic?.split(' ')[0] === data.user.id);
    if (data.guild.channels.cache.some(filter)) {
      return data.guild.channels.cache.find(filter);
    }

    const channel = await data.guild.channels.create(channelName, 'text');

    const parent = channel.setParent(config.moderation.logCategory);
    const topic = channel.setTopic(`${data.user.id} (NE PAS CHANGER)`);
    const permissions = channel.overwritePermissions([{
      id: config.roles.everyone,
      deny: ['VIEW_CHANNEL'],
    }, {
      id: config.roles.staff,
      allow: ['VIEW_CHANNEL', 'MANAGE_CHANNELS'],
    }, {
      id: data.user.id,
      allow: ['VIEW_CHANNEL'],
    }]);

    await Promise.all([parent, topic, permissions]).catch((_err) => {
      data.messageChannel.send(config.messages.errors.channelPermissions);
      logger.warn('Swan does not have sufficient permissions to edit GuildMember roles');
    });
    return channel;
  }

  static async removeChannel(data) {
    const channelName = `${config.moderation.banChannelPrefix}${prunePseudo(data.member)}`;
    const filter = c => c.type === 'text' && (c.name === channelName || c.topic?.split(' ')[0] === data.user.id);
    const chan = data.guild.channels.cache.find(filter);
    let file;

    if (chan) {
      const allMessages = await SanctionManager.getAllMessages(chan);
      file = SanctionManager.getMessageHistoryFile(data, allMessages);
      chan.delete();
    }
    return file;
  }

  static async addRole(data, overwrite = false) {
    const role = data.type === ACTION_TYPE.BAN
      ? data.guild.roles.resolve(config.roles.ban)
      : data.guild.roles.resolve(config.roles.mute);

    try {
      if (overwrite) await data.member.roles.set([role]);
      else await data.member.roles.add(role);
    } catch (_err) {
      data.messageChannel.send(config.messages.errors.rolePermissions);
      logger.warn('Swan does not have sufficient permissions to edit GuildMember roles');
    }
  }

  static async removeRole(data) {
    // On enlève le rôle de la victime
    const role = data.type === ACTION_TYPE.UNBAN
      ? data.guild.roles.resolve(config.roles.ban)
      : data.guild.roles.resolve(config.roles.mute);

    if (data.member.roles.cache.has(role.id)) {
      try {
        data.member.roles.remove(role);
      } catch (e) {
        data.messageChannel.send(config.messages.errors.rolePermissions).catch();
        logger.warn('Swan does not have sufficient permissions to edit GuildMember roles');
      }
    }
  }

  static async getAllMessages(chan) {
    const allMessagesMapped = await chan.messages.fetch().catch(console.error);
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

  static getMessageHistoryFile(data, messages) {
    let fileContent = `Historique des messages du salon du banni : ${data.member.user.username}.\n\n\nMessages :\n\n`;

    for (const message of messages) {
      const sentAt = moment(new Date(message.sentAt)).format('[à] HH:mm:ss [le] DD/MM/YY');

      let line = `[${message.id}] (${sentAt}) ${message.authorName} : ${message.content}`;
      if (message.edited) line = `[Modifié] ${line}`;
      fileContent += `${line}\n`;
    }

    let fileName = prunePseudo(data.member);
    const path = `${__dirname}/../../databases/ban-logs/`;
    let i = 1;
    if (fs.existsSync(`${path}${fileName}.txt`)) {
      while (fs.existsSync(`${path}${fileName}-${i}.txt`)) {
        i++;
      }
      fileName += `-${i}`;
    }

    fs.writeFile(`${path}${fileName}.txt`, fileContent, (err) => {
      if (err) throw new Error(err);
    });

    return {
      path: `${path}${fileName}.txt`,
      name: fileName,
    };
  }

  static deleteMessageHistoryFile(data) {
    // On doit attendre un peu car des fois, (rarement), il le supprime trop tôt (même avec les awaits etc)...
    setTimeout(() => {
      fs.unlink(data.file.path, (err) => {
        if (err) throw new Error(err);
      });
    }, 2000);
  }

  static async isBan(id) {
    const doc = await db.sanctions.findOne({ member: id, type: ACTION_TYPE.BAN }).catch(console.error);
    return !!doc;
  }

  static async hasSentMessages(id) {
    const history = await db.sanctionsHistory.findOne({ memberId: id }).catch(console.error);
    db.sanctions.update({ member: id, type: ACTION_TYPE.BAN, id: history.lastBanId }, { $set: { hasSentMessages: true } }).catch(console.error);
  }

  static async checkSanctions() {
    // Trouver tous les élements dont la propriété "finish" est inférieure ($lt) à maintenant et ($and) la durée
    // ("duration") n'est pas égale ($not) à -1 (= ban def)
    const query = {
      $and: [
        { finish: { $lt: Date.now() } },
        { $not: { duration: -1 } }],
    };
    const results = await db.sanctions.find(query).catch(console.error);

    for (const result of results) {
      const victim = client.guild.members.cache.get(result.member) || await client.users.fetch(result.member);
      const data = new ModerationData()
        .setType(ACTION_TYPE.opposite(result.type))
        .setColor(config.colors.success)
        .setVictim(victim)
        .setReason(config.messages.miscellaneous.sanctionExpired)
        .setModerator(client.guild.members.resolve(client.user.id))
        .setMessageChannel(client.guild.channels.resolve(config.channels.logs));

      if (result.type === ACTION_TYPE.BAN && !result.hasSentMessages && result.hardbanIfNoMessages) {
        data.setType(ACTION_TYPE.HARDBAN)
          .setColor(config.colors.hardban)
          .setReason(config.messages.miscellaneous.inactivityWhileBanned)
          .setDuration(-1)
          .setFinishTimestamp();
        new BanAction(data).commit();
        continue;
      }

      if (data.type === ACTION_TYPE.UNBAN) new UnbanAction(data).commit();
      else if (data.type === ACTION_TYPE.UNMUTE) new UnmuteAction(data).commit();
      else if (data.type === ACTION_TYPE.REMOVE_WARN) {
        data.setWarnId(result.id);
        new RemoveWarnAction(data).commit();
      }
    }
  }
}

export default SanctionManager;

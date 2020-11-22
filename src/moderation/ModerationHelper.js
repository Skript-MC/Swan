import { Permissions } from 'discord.js';
import settings from '../../config/settings';
import Sanction from '../models/sanction';
import Logger from '../structures/Logger';
import { constants, noop, prunePseudo } from '../utils';

class ModerationHelper {
  static async getOrCreateChannel(data) {
    const pseudo = prunePseudo(data.victim.member, data.victim.user, data.victim.id);
    const channelName = settings.moderation.banChannelPrefix + pseudo;

    const filter = c => c.type === 'text' && c.topic?.split(' ')[0] === data.victim.id.toString();
    if (data.guild.channels.cache.some(filter))
      return data.guild.channels.cache.find(filter);

    try {
      const channel = await data.guild.channels.create(
        channelName,
        {
          type: 'text',
          topic: `${data.victim.id} - ${settings.moderation.banChannelTopic.replace('{MEMBER}', data.victim.member.displayName)}`,
          parent: settings.channels.privateChannelsCategory,
          permissionOverwrites: [{
            id: settings.roles.everyone,
            deny: [Permissions.FLAGS.VIEW_CHANNEL, Permissions.FLAGS.CREATE_INSTANT_INVITE],
          }, {
            id: settings.roles.staff,
            allow: [Permissions.FLAGS.VIEW_CHANNEL, Permissions.FLAGS.MANAGE_CHANNELS],
          }, {
            id: data.victim.id,
            allow: [Permissions.FLAGS.VIEW_CHANNEL],
          }],
        },
      );
      return channel;
    } catch (error) {
      Logger.error(`Could not create the private channel for the ban of ${data.victim.member.displayName}.`);
      Logger.detail(`Member's name: "${data.victim.member.displayName}"`);
      Logger.detail(`Stripped name: "${pseudo}"`);
      Logger.detail(`Create channel permissions: ${data.guild.me.hasPermission(Permissions.FLAGS.MANAGE_CHANNELS)}`);
      Logger.error(error.stack);
      throw new Error('Private Channel Creation Failed');
    }
  }

  static removeChannel(data) {
    const filter = c => c.type === 'text' && c.topic?.split(' ')[0] === data.victim.id.toString();
    const chan = data.guild.channels.cache.find(filter);
    let file;

    if (chan) {
      // TODO: Get the message history here and upload it to a file.
      chan.delete();
    }
    return file;
  }

  static async isBanned(memberId, includeHardban = false) {
    const banTypes = [constants.SANCTIONS.TYPES.BAN];
    if (includeHardban)
      banTypes.push(constants.SANCTIONS.TYPES.HARDBAN);

    const banObject = await Sanction.findOne({
      memberId,
      revoked: false,
      type: { $in: banTypes },
    }).catch(noop);
    return banObject;
  }

  static async isMuted(memberId) {
    const banObject = await Sanction.findOne({
      memberId,
      revoked: false,
      type: constants.SANCTIONS.TYPES.MUTE,
    }).catch(noop);
    return banObject;
  }
}

export default ModerationHelper;

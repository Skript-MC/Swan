import { MessageEmbed } from 'discord.js';
import moment from 'moment';
import messages from '../../../config/messages';
import settings from '../../../config/settings';
import ConvictedUser from '../../models/convictedUser';
import Sanction from '../../models/sanction';
import { noop } from '../../utils';
import constants from '../../utils/constants';


const lastSanctionField = {
  [constants.SANCTIONS.TYPES.BAN]: 'lastBanId',
};


class ModerationAction {
  constructor(data) {
    this.data = data;
    this.client = this.data.client;
    this.logChannel = this.client.channels.resolve(settings.channels.log);
  }

  async commit() {
    const field = lastSanctionField[this.data.type];
    const user = await ConvictedUser.findOne({ memberId: this.data.victim.id }).catch(noop);
    const sanction = await Sanction.findOne({ memberId: this.data.victim.id, revoked: false, id: user?.[field] })
      .catch(noop);
    this.isUpdate = !!sanction;

    try {
      await this.before();
      await this.notify();
      await this.exec();
      await this.after();
      await this.log();
    } catch (error) {
      this.client.logger.error('An error occured while executing a moderation action.');
      this.client.logger.detail(`Data: ${JSON.stringify(this.data.toSchema())}`);
      this.client.logger.detail(error.stack);
      this.data.channel.send(messages.global.oops);
    }
  }

  get nameString() {
    return this.data.victim?.user?.toString() || messages.global.unknownName;
  }

  get moderatorString() {
    return this.data.moderator.toString() || messages.global.unknownName;
  }

  get action() {
    switch (this.data.type) {
      case constants.SANCTIONS.TYPES.BAN:
        if (this.isUpdate)
          return messages.moderation.sanctionNames.banUpdate;
        return messages.moderation.sanctionNames.ban;
      case constants.SANCTIONS.TYPES.HARDBAN:
        return messages.moderation.sanctionNames.hardban;
      case constants.SANCTIONS.TYPES.MUTE:
        if (this.isUpdate)
          return messages.moderation.sanctionNames.muteUpdate;
        return messages.moderation.sanctionNames.mute;
      case constants.SANCTIONS.TYPES.KICK:
        return messages.moderation.sanctionNames.kick;
      case constants.SANCTIONS.TYPES.WARN:
        return messages.moderation.sanctionNames.warn;
      case constants.SANCTIONS.TYPES.UNBAN:
        return messages.moderation.sanctionNames.unban;
      case constants.SANCTIONS.TYPES.UNMUTE:
        return messages.moderation.sanctionNames.unmute;
      case constants.SANCTIONS.TYPES.REMOVE_WARN:
        return messages.moderation.sanctionNames.removeWarn;
      default:
        this.client.logger.error('Assert Not Reached Error');
        this.client.logger.detail(`Unknown moderation action: ${this.data.type}`);
        this.client.logger.detail(`Allowed: ${Object.values(constants.SANCTIONS.TYPES)}`);
        throw new Error('Assert Not Reached');
    }
  }

  get color() {
    return settings.moderation.colors[this.data.type];
  }

  get duration() {
    return this.data.duration === -1
      ? messages.moderation.permanent
      : moment.duration(this.data.duration).humanize();
  }

  get expiration() {
    return this.data.duration === -1
      ? messages.moderation.never
      : moment(this.data.finish).format(settings.miscellaneous.durationFormat);
  }

  async before() {}

  async notify() {
    const message = this.data.config.notification
      .replace('{MEMBER}', this.nameString)
      .replace('{SANCTION}', this.action)
      .replace('{REASON}', this.data.reason)
      .replace('{DURATION}', this.duration);
    try {
      await (this.data.victim.member || this.data.victim.user)?.send(message);
    } catch {
      await this.data.channel.send(messages.moderation.memberHasClosedDm).catch(noop);
    }
  }

  async exec() {}

  async after() {}

  async log() {
    if (!this.logChannel)
      return;

    const embed = new MessageEmbed()
      .setColor(this.color)
      .setTitle(messages.moderation.newCase.replace('{ID}', this.data.id))
      .setTimestamp()
      .addField(messages.moderation.log.userTitle, `${this.nameString}\n${this.data.victim.id}`, true)
      .addField(messages.moderation.log.moderatorTitle, `${this.moderatorString}\n${this.data.moderator.id}`, true)
      .addField(messages.moderation.log.actionTitle, this.action.toString(), true)
      .addField(messages.moderation.log.reasonTitle, this.data.reason.toString(), true);

    if (this.data.duration && this.data.type !== constants.SANCTIONS.TYPES.WARN) {
      let content = this.duration;
      if (this.data?.finish !== -1)
        content += messages.moderation.log.durationDescription.replace('{EXPIRATION}', this.expiration);
      embed.addField(messages.moderation.log.durationTitle, content, true);
    }
    if (this.data.privateChannel)
      embed.addField(messages.moderation.log.privateChannelTitle, this.data.privateChannel.toString(), true);

    this.logChannel.send(embed);
  }
}

export default ModerationAction;

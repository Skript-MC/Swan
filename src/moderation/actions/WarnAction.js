import { User, GuildMember } from 'discord.js';
import messages from '../../../config/messages';
import settings from '../../../config/settings';
import ConvictedUser from '../../models/convictedUser';
import Sanction from '../../models/sanction';
import Logger from '../../structures/Logger';
import { constants, noop } from '../../utils';
import ModerationData from '../ModerationData';
import ModerationError from '../ModerationError';
import BanAction from './BanAction';
import ModerationAction from './ModerationAction';

class WarnAction extends ModerationAction {
  async exec() {
    await this.warn();
    return true;
  }

  async warn() {
    // Add to the database
    try {
      const user = await ConvictedUser.findOneAndUpdate(
        { memberId: this.data.victim.id },
        { $inc: { currentWarnCount: 1 } },
        { upsert: true, new: true },
      );
      await Sanction.create({ ...this.data.toSchema(), user: user._id });
    } catch (error) {
      this.errorState.addError(
        new ModerationError()
          .from(error)
          .setMessage('An error occured while inserting warning to database')
          .addDetail('Victim: GuildMember', this.data.victim.member instanceof GuildMember)
          .addDetail('Victim: User', this.data.victim.user instanceof User)
          .addDetail('Victim: ID', this.data.victim.id),
      );
    }
  }

  async after() {
    try {
      // Check if they have exceeded the warning limit (before banishment)
      const user = await ConvictedUser.findOne({ memberId: this.data.victim.id });

      if (!user) {
        Logger.warn('An unexpected situation happened: Could not find a convicted user after a warn.');
        Logger.detail(`Victim: GuildMember: ${this.data.victim.member instanceof GuildMember}`);
        Logger.detail(`Victim: User: ${this.data.victim.user instanceof User}`);
        Logger.detail(`Victim: ID: ${this.data.victim.id}`);
        return;
      }

      // If they have exceeded the warning limit
      if (user.currentWarnCount >= settings.moderation.warnLimitBeforeBan) {
        // 1. Reset their warning count
        await ConvictedUser.findByIdAndUpdate(user._id, { $set: { currentWarnCount: 0 } });

        // 2. Revoke all the current warnings
        await Sanction.updateMany(
          {
            memberId: this.data.victim.id,
            type: constants.SANCTIONS.TYPES.WARN,
            revoked: false,
          },
          {
            $set: { revoked: true },
            $push: {
              updates: {
                date: this.data.start,
                moderator: this.data.moderator?.id,
                type: constants.SANCTIONS.UPDATES.REVOKED,
                reason: messages.moderation.reasons.revokeWarnsLimitExceeded,
              },
            },
          },
        );

        // 3. Ban
        const channel = this.client.guild.channels.resolve(settings.channels.log);
        const data = new ModerationData(this.client.guild.me, this.client.guild, this.client, channel)
          .setVictim(this.data.victim.member || this.data.victim.user, false)
          .setReason(messages.moderation.reasons.autoBanWarnLimitExceeded)
          .setDuration(settings.moderation.warnLimitBanDuration * 1000, true)
          .setInformations({ hasSentMessage: true })
          .setType(constants.SANCTIONS.TYPES.BAN);

        await new BanAction(data).commit();

        // 4. Send message
        this.data.channel.send(this.data.config.banSuccess).catch(noop);
      }
    } catch (error) {
      this.errorState.addError(
        new ModerationError()
          .from(error)
          .setMessage('An error occured while checking for the warning limit')
          .addDetail('Victim: GuildMember', this.data.victim.member instanceof GuildMember)
          .addDetail('Victim: User', this.data.victim.user instanceof User)
          .addDetail('Victim: ID', this.data.victim.id),
      );
    }
  }
}

export default WarnAction;

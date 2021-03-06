import { GuildMember, User } from 'discord.js';
import ConvictedUser from '@/app/models/convictedUser';
import Sanction from '@/app/models/sanction';
import ModerationData from '@/app/moderation/ModerationData';
import ModerationError from '@/app/moderation/ModerationError';
import Logger from '@/app/structures/Logger';
import { SanctionsUpdates, SanctionTypes } from '@/app/types';
import { noop } from '@/app/utils';
import messages from '@/conf/messages';
import settings from '@/conf/settings';
import BanAction from './BanAction';
import ModerationAction from './ModerationAction';

class WarnAction extends ModerationAction {
  protected before: undefined;

  protected async after(): Promise<void> {
    try {
      // Check if they have exceeded the warning limit (before banishment).
      const user = await ConvictedUser.findOne({ memberId: this.data.victim.id });

      if (!user) {
        Logger.warn('An unexpected situation happened: Could not find a convicted user after a warn.');
        Logger.detail(`Victim: GuildMember: ${this.data.victim.member instanceof GuildMember}`);
        Logger.detail(`Victim: User: ${this.data.victim.user instanceof User}`);
        Logger.detail(`Victim: ID: ${this.data.victim.id}`);
        return;
      }

      // If they have exceeded the warning limit
      if (user.currentWarnCount && user.currentWarnCount >= settings.moderation.warnLimitBeforeBan) {
        // 1. Reset their warning count
        await ConvictedUser.findByIdAndUpdate(user._id, { $set: { currentWarnCount: 0 } });

        // 2. Revoke all the current warnings
        await Sanction.updateMany(
          {
            memberId: this.data.victim.id,
            type: SanctionTypes.Warn,
            revoked: false,
          },
          {
            $set: { revoked: true },
            $push: {
              updates: {
                date: this.data.start,
                moderator: this.data.moderator?.id,
                type: SanctionsUpdates.Revoked,
                reason: messages.moderation.reasons.revokeWarnsLimitExceeded,
              },
            },
          },
        );

        // 3. Ban the member
        const data = new ModerationData(this.client)
          .setVictim(this.data.victim.member ?? this.data.victim.user, false)
          .setReason(messages.moderation.reasons.autoBanWarnLimitExceeded)
          .setDuration(settings.moderation.warnLimitBanDuration * 1000, true)
          .setInformations({ shouldAutobanIfNoMessages: false })
          .setType(SanctionTypes.Ban);

        await new BanAction(data).commit();

        // 4. Send the message
        this.data.channel.send(this.data.config.banSuccess).catch(noop);
      }
    } catch (unknownError: unknown) {
      this.errorState.addError(
        new ModerationError()
          .from(unknownError as Error)
          .setMessage('An error occurred while checking for the warning limit')
          .addDetail('Victim: GuildMember', this.data.victim.member instanceof GuildMember)
          .addDetail('Victim: User', this.data.victim.user instanceof User)
          .addDetail('Victim: ID', this.data.victim.id),
      );
    }
  }

  protected async exec(): Promise<void> {
    await this._warn();
  }

  private async _warn(): Promise<void> {
    // Add to the Database
    try {
      const user = await ConvictedUser.findOneAndUpdate(
        { memberId: this.data.victim.id },
        { $inc: { currentWarnCount: 1 } },
        { upsert: true, new: true },
      );
      await Sanction.create({ ...this.data.toSchema(), user: user._id });
    } catch (unknownError: unknown) {
      this.errorState.addError(
        new ModerationError()
          .from(unknownError as Error)
          .setMessage('An error occurred while inserting warning to database')
          .addDetail('Victim: GuildMember', this.data.victim.member instanceof GuildMember)
          .addDetail('Victim: User', this.data.victim.user instanceof User)
          .addDetail('Victim: ID', this.data.victim.id),
      );
    }
  }
}

export default WarnAction;

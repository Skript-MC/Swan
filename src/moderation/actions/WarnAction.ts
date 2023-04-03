import { GuildMember, User } from 'discord.js';
import Sanction from '@/app/models/sanction';
import ModerationData from '@/app/moderation/ModerationData';
import ModerationError from '@/app/moderation/ModerationError';
import ModerationHelper from '@/app/moderation/ModerationHelper';
import BanAction from '@/app/moderation/actions/BanAction';
import ModerationAction from '@/app/moderation/actions/ModerationAction';
import { SanctionsUpdates, SanctionTypes } from '@/app/types';
import messages from '@/conf/messages';
import settings from '@/conf/settings';

export default class WarnAction extends ModerationAction {
  protected before: undefined;

  protected async after(): Promise<void> {
    try {
      const currentWarnCount = await ModerationHelper.getCurrentWarnCount(this.data.victim.id);

      // If they have exceeded the warning limit
      if (currentWarnCount && currentWarnCount >= settings.moderation.warnLimitBeforeBan) {
        // 1. Revoke all the current warnings
        await Sanction.updateMany(
          {
            userId: this.data.victim.id,
            type: SanctionTypes.Warn,
            revoked: false,
          },
          {
            $set: { revoked: true },
            $push: {
              updates: {
                date: this.data.start,
                moderator: this.data.moderatorId,
                type: SanctionsUpdates.Revoked,
                reason: messages.moderation.reasons.revokeWarnsLimitExceeded,
              },
            },
          },
        );

        // 2. Ban the member
        const data = new ModerationData()
          .setVictim(this.data.victim.member ?? this.data.victim.user, false)
          .setReason(messages.moderation.reasons.autoBanWarnLimitExceeded)
          .setDuration(settings.moderation.warnLimitBanDuration * 1000, true)
          .setType(SanctionTypes.TempBan);

        await new BanAction(data).commit();
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
    // Add to the database
    try {
      await Sanction.create({ ...this.data.toSchema(), userId: this.data.victim.id });
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

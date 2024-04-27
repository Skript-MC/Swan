import * as messages from '#config/messages';
import { moderation } from '#config/settings';
import { Sanction } from '#models/sanction';
import { ModerationData } from '#moderation/ModerationData';
import { ModerationError } from '#moderation/ModerationError';
import * as ModerationHelper from '#moderation/ModerationHelper';
import { BanAction } from '#moderation/actions/BanAction';
import { ModerationAction } from '#moderation/actions/ModerationAction';
import { SanctionTypes, SanctionsUpdates } from '#types/index';

export class WarnAction extends ModerationAction {
  protected before: undefined;

  protected async after(): Promise<void> {
    try {
      const currentWarnCount = await ModerationHelper.getCurrentWarnCount(
        this.data.victimId,
      );

      // If they have exceeded the warning limit
      if (currentWarnCount >= moderation.warnLimitBeforeBan) {
        // 1. Revoke all the current warnings
        await Sanction.updateMany(
          {
            userId: this.data.victimId,
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
          .setVictim({ id: this.data.victimId, name: this.data.victimName })
          .setReason(messages.moderation.reasons.autoBanWarnLimitExceeded)
          .setDuration(moderation.warnLimitBanDuration * 1000, true)
          .setType(SanctionTypes.TempBan);

        await new BanAction(data).commit();
      }
    } catch (unknownError: unknown) {
      this.errorState.addError(
        new ModerationError()
          .from(unknownError as Error)
          .setMessage('An error occurred while checking for the warning limit')
          .addDetail('Victim ID', this.data.victimId),
      );
    }
  }

  protected async exec(): Promise<void> {
    await this._warn();
  }

  private async _warn(): Promise<void> {
    // Add to the database
    try {
      await Sanction.create({
        ...this.data.toSchema(),
        userId: this.data.victimId,
      });
    } catch (unknownError: unknown) {
      this.errorState.addError(
        new ModerationError()
          .from(unknownError as Error)
          .setMessage('An error occurred while inserting warning to database')
          .addDetail('Victim ID', this.data.victimId),
      );
    }
  }
}

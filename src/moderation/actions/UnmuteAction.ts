import { User } from 'discord.js';
import { Sanction } from '@/app/models/sanction';
import { ModerationError } from '@/app/moderation/ModerationError';
import { ModerationAction } from '@/app/moderation/actions/ModerationAction';
import { SanctionsUpdates } from '@/app/types';

export class UnmuteAction extends ModerationAction {
  protected before: undefined;
  protected after: undefined;

  protected async exec(): Promise<void> {
    await this._unmute();
  }

  private async _unmute(): Promise<void> {
    // 1. Update the database
    try {
      await Sanction.findOneAndUpdate(
        { sanctionId: this.data.sanctionId },
        {
          $set: { revoked: true },
          $push: {
            updates: {
              date: this.data.start,
              moderator: this.data.moderatorId,
              type: SanctionsUpdates.Revoked,
              reason: this.data.reason,
            },
          },
        },
      );
    } catch (unknownError: unknown) {
      this.errorState.addError(
        new ModerationError()
          .from(unknownError as Error)
          .setMessage('An error occurred while revoking a mute in the database')
          .addDetail('Unmute ID', this.data.sanctionId)
          .addDetail('Is User', this.data.victim.user instanceof User)
          .addDetail('User ID', this.data.victim.id)
          .addDetail('Unmute Reason', this.data.reason),
      );
    }
  }
}

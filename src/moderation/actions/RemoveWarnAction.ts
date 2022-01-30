import { User } from 'discord.js';
import ConvictedUser from '@/app/models/convictedUser';
import Sanction from '@/app/models/sanction';
import ModerationError from '@/app/moderation/ModerationError';
import ModerationAction from '@/app/moderation/actions/ModerationAction';
import { SanctionsUpdates, SanctionTypes } from '@/app/types';

export default class RemoveWarnAction extends ModerationAction {
  protected before: undefined;
  protected after: undefined;

  protected async exec(): Promise<void> {
    await this._removeWarn();
  }

  private async _removeWarn(): Promise<void> {
    // 1. Update the Database
    try {
      await ConvictedUser.findOneAndUpdate(
        { memberId: this.data.victim.id },
        { $inc: { currentWarnCount: -1 } },
      );
      await Sanction.findOneAndUpdate(
        {
          memberId: this.data.victim.id,
          type: SanctionTypes.Warn,
          revoked: false,
          sanctionId: this.data.originalWarnId,
        },
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
        { sort: { start: 'descending' } },
      );
    } catch (unknownError: unknown) {
      this.errorState.addError(
        new ModerationError()
          .from(unknownError as Error)
          .setMessage('An error occurred while revoking a warn in the Database')
          .addDetail('RemoveWarn ID', this.data.sanctionId)
          .addDetail('Is User', this.data.victim.user instanceof User)
          .addDetail('User ID', this.data.victim.id)
          .addDetail('RemoveWarn Reason', this.data.reason),
      );
    }
  }
}

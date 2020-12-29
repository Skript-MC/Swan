import { User } from 'discord.js';
import ConvictedUser from '../../models/convictedUser';
import Sanction from '../../models/sanction';
import { SanctionTypes, SanctionsUpdates } from '../../types';
import ModerationError from '../ModerationError';
import ModerationAction from './ModerationAction';

class RemoveWarnAction extends ModerationAction {
  protected before(): void { /* */ }

  protected after(): void { /* */ }

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
      // TODO: Add the possibility to remove a specific warn, as long as it is not revoked yet.
      await Sanction.findOneAndUpdate(
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
          .setMessage('An error occured while revoking a warn in the Database')
          .addDetail('RemoveWarn ID', this.data.sanctionId)
          .addDetail('Is User', this.data.victim.user instanceof User)
          .addDetail('User ID', this.data.victim.id)
          .addDetail('RemoveWarn Reason', this.data.reason),
      );
    }
  }
}

export default RemoveWarnAction;

import { User } from 'discord.js';
import ConvictedUser from '@/app/models/convictedUser';
import Sanction from '@/app/models/sanction';
import ModerationError from '@/app/moderation/ModerationError';
import ModerationAction from '@/app/moderation/actions/ModerationAction';
import { SanctionsUpdates } from '@/app/types';

export default class UnmuteAction extends ModerationAction {
  protected before: undefined;
  protected after: undefined;

  protected async exec(): Promise<void> {
    await this._unmute();
  }

  private async _unmute(): Promise<void> {
    // 1. Update the Database
    try {
      const user = await ConvictedUser.findOneAndUpdate({ memberId: this.data.victim.id }, { currentMuteId: null });
      if (!user)
        throw new TypeError('The user to unmute was not found in the database.');

      await Sanction.findOneAndUpdate(
        { sanctionId: user.currentMuteId },
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
          .setMessage('An error occurred while revoking a mute in the Database')
          .addDetail('Unmute ID', this.data.sanctionId)
          .addDetail('Is User', this.data.victim.user instanceof User)
          .addDetail('User ID', this.data.victim.id)
          .addDetail('Unmute Reason', this.data.reason),
      );
    }
  }
}

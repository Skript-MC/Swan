import { User } from 'discord.js';
import ConvictedUser from '../../models/convictedUser';
import Sanction from '../../models/sanction';
import { constants } from '../../utils';
import ModerationError from '../ModerationError';
import ModerationAction from './ModerationAction';

class RemoveWarnAction extends ModerationAction {
  async exec() {
    await this.removeWarn();
  }

  async removeWarn() {
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
              reason: this.data.reason,
            },
          },
        },
        { sort: { start: 'descending' } },
      );
    } catch (error) {
      this.errorState.addError(
        new ModerationError()
          .from(error)
          .setMessage('An error occured while revoking a warn in the Database')
          .addDetail('RemoveWarn ID', this.data.id)
          .addDetail('Is User', this.data.victim.user instanceof User)
          .addDetail('User ID', this.data.victim.id)
          .addDetail('RemoveWarn Reason', this.data.reason),
      );
    }
  }
}

export default RemoveWarnAction;

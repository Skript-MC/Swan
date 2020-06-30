import ModerationAction from './ModerationAction';
import { client, db } from '../../main';
import ACTION_TYPE from './actionType';

class RemoveWarnAction extends ModerationAction {
  constructor(data) {
    super(data);
    this.config = client.config.messages.commands.removewarn;
  }

  async exec(_document) {
    // Regarde dans la bdd si le warn existe
    const warnExists = await db.sanctions.findOne({ member: this.data.victimId, type: ACTION_TYPE.WARN }).catch(console.error);
    if (!warnExists) {
      return this.data.messageChannel.sendError(this.config.alreadyRevoked, this.data.moderator);
    }

    if (!this.data.sendSuccessIfBot && this.data.moderator.user.bot) return;
    const successMessage = this.config.successfullyUnwarned
      .replace('%d', this.data.warnId)
      .replace('%u', this.data.getUserName())
      .replace('%r', this.data.reason);
    this.data.messageChannel.sendSuccess(successMessage, this.data.moderator);
  }
}

export default RemoveWarnAction;

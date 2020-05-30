/* eslint-disable import/no-cycle */
import ModerationAction from './ModerationAction';
import { client, db } from '../../main';
import SanctionManager from '../SanctionManager';
import ACTION_TYPE from './actionType';

class UnmuteAction extends ModerationAction {
  constructor(data) {
    super(data);
    this.config = client.config.messages.commands.unmute;
  }

  async exec(_document) {
    // Regarde dans la bdd si le joueur est mute
    const isMute = await db.sanctions.findOne({ member: this.data.user.id, type: ACTION_TYPE.MUTE }).catch(console.error);
    if (isMute) {
      await SanctionManager.removeRole(this.data);
    } else {
      return this.data.messageChannel.sendError(this.config.notMuted.replace('%u', this.data.username), this.data.moderator);
    }

    if ((!this.data.sendSuccessIfBot && this.data.moderator.user.bot) || this.data.silent) return;
    const successMessage = this.config.successfullyUnmuted
      .replace('%u', this.data.user.username)
      .replace('%r', this.data.reason);
    this.data.messageChannel.sendSuccess(successMessage, this.data.moderator);
  }
}

export default UnmuteAction;

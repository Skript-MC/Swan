/* eslint-disable import/no-cycle */
import ModerationAction from './ModerationAction';
import { config, db } from '../../main';
import SanctionManager from '../SanctionManager';
import ACTION_TYPE from './actionType';

class UnbanAction extends ModerationAction {
  constructor(data) {
    super(data);
    this.config = config.messages.commands.unban;
  }

  async exec(_document) {
    // Regarde dans la bdd si le joueur est banni
    const isHardban = await db.sanctions.findOne({ member: this.data.user.id, type: ACTION_TYPE.HARDBAN }).catch(console.error);
    if (isHardban) {
      await this.data.guild.members.unban(this.data.user.id, this.data.reason);
    } else {
      const isBan = await db.sanctions.findOne({ member: this.data.user.id, type: ACTION_TYPE.BAN }).catch(console.error);
      if (isBan) {
        await SanctionManager.removeRole(this.data);
        const file = await SanctionManager.removeChannel(this.data);
        this.data.setFile(file);
        this.data.shouldRemoveFile(true);
      }
    }

    if (!this.data.sendSuccessIfBot && this.data.moderator.user.bot) return;
    const successMessage = this.config.successfullyUnbanned
      .replace('%u', this.data.user.username)
      .replace('%r', this.data.reason);
    this.data.messageChannel.sendSuccess(successMessage, this.data.moderator);
  }
}

export default UnbanAction;

import ModerationAction from './ModerationAction';
import { client, db } from '../../main';
import SanctionManager from '../SanctionManager';
import { toDuration } from '../../utils';

class MuteAction extends ModerationAction {
  constructor(data) {
    super(data);
    this.config = client.config.messages.commands.mute;
  }

  async exec(document) {
    if (document) this.remute();
    else this.mute();
  }

  async mute() {
    await SanctionManager.addRole(this.data);

    // Envoyer les messages
    if (!this.data.moderator.user.bot || (this.data.sendSuccessIfBot && this.data.moderator.user.bot)) {
      const successMessage = this.config.successfullyMuted
        .replace('%u', this.data.getUserName())
        .replace('%r', this.data.reason)
        .replace('%d', toDuration(this.data.duration));
      this.data.messageChannel.sendSuccess(successMessage, this.data.moderator);
    }
  }

  async remute() {
    // Envoyer les messages
    if (!this.data.moderator.user.bot || (this.data.sendSuccessIfBot && this.data.moderator.user.bot)) {
      const successMessage = this.config.durationUpdated
        .replace('%u', this.data.getUserName())
        .replace('%r', this.data.reason)
        .replace('%d', toDuration(this.data.duration));
      this.data.messageChannel.sendSuccess(successMessage, this.data.moderator);
    }

    db.sanctions.update(
      { member: this.data.victimId },
      { $set: { duration: this.data.duration, finish: this.data.finish } },
    );
  }
}

export default MuteAction;

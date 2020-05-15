import ModerationAction from './ModerationAction';
import { client } from '../../main';

class KickAction extends ModerationAction {
  constructor(data) {
    super(data);
    this.config = client.config.messages.commands.kick;
  }

  async exec(_document) {
    this.kick();
  }

  async kick() {
    await this.data.member.kick(this.data.reason);

    // Envoyer les messages
    if (!this.data.moderator.user.bot || (this.data.sendSuccessIfBot && this.data.moderator.user.bot)) {
      const successMessage = this.config.successfullyKicked
        .replace('%u', this.data.user.username)
        .replace('%r', this.data.reason);
      this.data.messageChannel.sendSuccess(successMessage, this.data.moderator);
    }
  }
}

export default KickAction;

/* eslint-disable import/no-cycle */
import moment from 'moment';
import ModerationAction from './ModerationAction';
import { config, db } from '../../main';
import SanctionManager from '../SanctionManager';
import { toDuration } from '../../utils';

class BanAction extends ModerationAction {
  constructor(data) {
    super(data);
    this.config = config.messages.commands.ban;
  }

  async exec(document) {
    if (this.data.duration === -1) {
      this.hardBan();
    } else if (document) {
      const chan = await SanctionManager.getOrCreateChannel(this.data);
      this.data.setPrivateChannel(chan);
      this.reban();
    } else {
      this.ban();
    }
  }

  async ban() {
    await SanctionManager.addRole(this.data, true);
    const chan = await SanctionManager.getOrCreateChannel(this.data);
    this.data.setPrivateChannel(chan);

    // Envoyer les messages
    if (!this.data.moderator.user.bot || (this.data.sendSuccessIfBot && this.data.moderator.user.bot)) {
      const successMessage = this.config.successfullyBanned
        .replace('%u', this.data.user.username)
        .replace('%r', this.data.reason)
        .replace('%d', toDuration(this.data.duration));
      this.data.messageChannel.sendSuccess(successMessage, this.data.moderator);
    }

    const whyHere = this.config.whyHere
      .replace('%u', this.data.user.username)
      .replace('%r', this.data.reason)
      .replace('%d', toDuration(this.data.duration))
      .replace('%e', moment(this.data.finish).format('[à] HH:mm:ss [le] DD/MM/YYYY'));
    const message = await chan.send(whyHere);
    message.pin();
  }

  async reban() {
    if (this.data.duration === -1) return this.hardBan();

    // Envoyer les messages
    if (!this.data.moderator.user.bot || (this.data.sendSuccessIfBot && this.data.moderator.user.bot)) {
      const successMessage = this.config.durationUpdated
        .replace('%u', this.data.user.username)
        .replace('%r', this.data.reason)
        .replace('%d', toDuration(this.data.duration));
      this.data.messageChannel.sendSuccess(successMessage, this.data.moderator);
    }

    db.sanctions.update(
      { member: this.data.user.id },
      { $set: { duration: this.data.duration, finish: this.data.finish } },
    );
    return this.data.privateChannel.send(this.config.sanctionUpdated.replace('%d', toDuration(this.data.duration)));
  }

  async hardBan() {
    if (!this.data.moderator.user.bot || (this.data.sendSuccessIfBot && this.data.moderator.user.bot)) {
      const successMessage = this.config.successfullyBanned
        .replace('%u', this.data.user.username)
        .replace('%r', this.data.reason)
        .replace('%d', toDuration(this.data.duration));
      this.data.messageChannel.sendSuccess(successMessage, this.data.moderator);
    }

    await db.sanctions.remove({ member: this.data.user.id }).catch(console.error);

    // Delete channel
    const file = await SanctionManager.removeChannel(this.data);
    this.data.setFile(file);
    this.data.shouldRemoveFile(true);

    // Ban
    const reason = `Raison: ${this.data.reason}. Modérateur ${this.data.moderator.user.username}. Date: ${moment(Date.now()).format('[le] DD/MM/YYYY [à] HH:mm:ss')}`;
    this.data.member.ban({ reason });
  }
}

export default BanAction;

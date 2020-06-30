import moment from 'moment';
import ModerationAction from './ModerationAction';
import { client, db } from '../../main';
import SanctionManager from '../SanctionManager';
import { toDuration } from '../../utils';
import ACTION_TYPE from './actionType';
import ModerationData from '../ModerationData';
import UnmuteAction from './UnmuteAction';

class BanAction extends ModerationAction {
  constructor(data) {
    super(data);
    this.config = client.config.messages.commands.ban;
  }

  async before() {
    // Unmute him if he's mute
    if (await SanctionManager.isMuted(this.data.victimId)) {
      const data = new ModerationData()
        .setType(ACTION_TYPE.UNMUTE)
        .setColor(client.config.colors.success)
        .setVictimId(this.data.victimId)
        .setReason(client.config.messages.miscellaneous.autoUnmuteBeforeBan)
        .setModerator(client.guild.members.resolve(client.user.id))
        .setMessageChannel(this.data.messageChannel)
        .shouldBeSilent(true);
      await new UnmuteAction(data).commit();
    }
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
        .replace('%u', this.data.getUserName())
        .replace('%r', this.data.reason)
        .replace('%d', toDuration(this.data.duration));
      this.data.messageChannel.sendSuccess(successMessage, this.data.moderator);
    }

    const whyHere = this.config.whyHere
      .replace('%u', this.data.getUserName())
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
        .replace('%u', this.data.getUserName())
        .replace('%r', this.data.reason)
        .replace('%d', toDuration(this.data.duration));
      this.data.messageChannel.sendSuccess(successMessage, this.data.moderator);
    }

    db.sanctions.update(
      { member: this.data.victimId },
      { $set: { duration: this.data.duration, finish: this.data.finish } },
    );
    this.data.privateChannel.send(this.config.sanctionUpdated.replace('%d', toDuration(this.data.duration)));
  }

  async hardBan() {
    if (!this.data.moderator.user.bot || (this.data.sendSuccessIfBot && this.data.moderator.user.bot)) {
      const successMessage = this.config.successfullyBanned
        .replace('%u', this.data.getUserName())
        .replace('%r', this.data.reason)
        .replace('%d', toDuration(this.data.duration));
      this.data.messageChannel.sendSuccess(successMessage, this.data.moderator);
    }

    // We send him this awesome gif
    await this.data.user.send('https://tenor.com/view/cosmic-ban-ban-hammer-gif-14966695').catch(() => {});

    await db.sanctions.remove({ member: this.data.victimId, type: ACTION_TYPE.BAN }).catch(console.error);

    // Delete channel
    const file = await SanctionManager.removeChannel(this.data);
    this.data.setFile(file);

    // Ban
    const reason = `Raison: ${this.data.reason}. Modérateur ${this.data.moderator.user.username}. Date: ${moment(Date.now()).format('[le] DD/MM/YYYY [à] HH:mm:ss')}`;
    await this.data.member.ban({ reason });
  }
}

export default BanAction;

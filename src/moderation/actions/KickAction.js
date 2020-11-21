import { Permissions, User, GuildMember } from 'discord.js';
import messages from '../../../config/messages';
import ConvictedUser from '../../models/convictedUser';
import Sanction from '../../models/sanction';
import ModerationAction from './ModerationAction';

class KickAction extends ModerationAction {
  async exec() {
    await this.kick();
    return true;
  }

  async kick() {
    // 1. Add to the database
    try {
      const user = await ConvictedUser.findOneOrCreate(
        { memberId: this.data.victim.id },
        { memberId: this.data.victim.id },
      );
      await Sanction.create({ ...this.data.toSchema(), user: user._id });
    } catch (error) {
      this.data.channel.send(messages.global.oops);
      this.client.logger.error('An error occured while inserting kick to DB');
      this.client.logger.detail(`Victim: GuildMember=${this.data.victim.member instanceof GuildMember} / User=${this.data.victim.user instanceof User} / ID=${this.data.victim.id}`);
      this.client.logger.error(error.stack);
    }

    // 2. Kick the member
    try {
      await this.data.victim.member?.kick(this.data.reason);
    } catch (error) {
      this.data.channel.send(messages.global.oops);
      this.client.logger.error('Swan does not have sufficient permissions to kick a GuildMember');
      this.client.logger.detail(`Victim: GuildMember=${this.data.victim.member instanceof GuildMember} / User=${this.data.victim.user instanceof User} / ID=${this.data.victim.id}`);
      this.client.logger.detail(`Kick Member Permission: ${this.data.guild.me.hasPermission(Permissions.FLAGS.KICK_MEMBERS)}`);
      this.client.logger.error(error.stack);
    }

    this.client.logger.success('Kick finished successfully');
  }
}

export default KickAction;

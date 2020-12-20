import { Permissions, User, GuildMember } from 'discord.js';
import ConvictedUser from '../../models/convictedUser';
import Sanction from '../../models/sanction';
import ModerationError from '../ModerationError';
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
      this.errorState.addError(
        new ModerationError()
          .from(error)
          .setMessage('An error occured while inserting kick to database')
          .addDetail('Victim: GuildMember', this.data.victim.member instanceof GuildMember)
          .addDetail('Victim: User', this.data.victim.user instanceof User)
          .addDetail('Victim: ID', this.data.victim.id),
      );
    }

    // 2. Kick the member
    try {
      await this.data.victim.member?.kick(this.data.reason);
    } catch (error) {
      this.errorState.addError(
        new ModerationError()
          .from(error)
          .setMessage('Swan does not have sufficient permissions to kick a GuildMember')
          .addDetail('Victim: GuildMember', this.data.victim.member instanceof GuildMember)
          .addDetail('Victim: User', this.data.victim.user instanceof User)
          .addDetail('Victim: ID', this.data.victim.id)
          .addDetail('Kick Member Permission', this.data.guild.me.hasPermission(Permissions.FLAGS.KICK_MEMBERS)),
      );
    }
  }
}

export default KickAction;

import {
  Role,
  Permissions,
  User,
  GuildMember,
} from 'discord.js';
import settings from '../../../config/settings';
import ConvictedUser from '../../models/convictedUser';
import Sanction from '../../models/sanction';
import ModerationError from '../ModerationError';
import ModerationAction from './ModerationAction';

class MuteAction extends ModerationAction {
  async exec() {
    await this.mute();
    return true;
  }

  async mute() {
    // 1. Add to the database
    try {
      const user = await ConvictedUser.findOneAndUpdate(
        { memberId: this.data.victim.id },
        { lastMuteId: this.data.id },
        { upsert: true, new: true },
      );
      await Sanction.create({ ...this.data.toSchema(), user: user._id });
    } catch (error) {
      this.errorState.addError(
        new ModerationError()
          .from(error)
          .setMessage('An error occured while inserting mute to DB')
          .addDetail('Victim: GuildMember', this.data.victim.member instanceof GuildMember)
          .addDetail('Victim: User', this.data.victim.user instanceof User)
          .addDetail('Victim: ID', this.data.victim.id),
      );
    }

    // 2. Mute the member
    const role = this.data.guild.roles.resolve(settings.roles.mute);
    try {
      await this.data.victim.member?.roles.add(role, this.data.reason);
    } catch (error) {
      this.errorState.addError(
        new ModerationError()
          .from(error)
          .setMessage('Swan does not have sufficient permissions to mute a GuildMember')
          .addDetail('Victim: GuildMember', this.data.victim.member instanceof GuildMember)
          .addDetail('Victim: User', this.data.victim.user instanceof User)
          .addDetail('Victim: ID', this.data.victim.id)
          .addDetail('Role: is Role', role instanceof Role)
          .addDetail('Role: ID', settings.roles.mute)
          .addDetail('Add Role Permission', this.data.guild.me.hasPermission(Permissions.FLAGS.MANAGE_ROLES)),
      );
    }
  }
}

export default MuteAction;

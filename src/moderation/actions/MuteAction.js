import {
  Role,
  Permissions,
  User,
  GuildMember,
} from 'discord.js';
import settings from '../../../config/settings';
import ConvictedUser from '../../models/convictedUser';
import Sanction from '../../models/sanction';
import { constants } from '../../utils';
import ModerationError from '../ModerationError';
import ModerationAction from './ModerationAction';

class MuteAction extends ModerationAction {
  async exec() {
    // eslint-disable-next-line unicorn/prefer-ternary
    if (this.updateInfos.isUpdate())
      await this.remute();
    else
      await this.mute();
    return true;
  }

  async remute() {
    // Update the database
    try {
      await Sanction.findOneAndUpdate(
        { memberId: this.data.victim.id, id: this.updateInfos.userDocument.lastMuteId },
        {
          $set: {
            duration: this.data.duration,
            finish: this.updateInfos.sanctionDocument.start + this.data.duration,
          },
          $push: {
            updates: {
              date: this.data.start,
              moderator: this.data.moderator?.id,
              type: constants.SANCTIONS.UPDATES.DURATION,
              valueBefore: this.updateInfos.sanctionDocument.duration,
              valueAfter: this.data.duration,
              reason: this.data.reason,
            },
          },
        },
      );
    } catch (error) {
      this.errorState.addError(
        new ModerationError()
          .from(error)
          .setMessage('An error occured while inserting mute to database')
          .addDetail('Victim: GuildMember', this.data.victim.member instanceof GuildMember)
          .addDetail('Victim: User', this.data.victim.user instanceof User)
          .addDetail('Victim: ID', this.data.victim.id),
      );
    }
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
          .setMessage('An error occured while inserting mute to database')
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

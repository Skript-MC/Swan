import { GuildMember, User, Permissions } from 'discord.js';
import settings from '../../../config/settings';
import ConvictedUser from '../../models/convictedUser';
import Sanction from '../../models/sanction';
import { constants } from '../../utils';
import ModerationError from '../ModerationError';
import ModerationAction from './ModerationAction';

class UnmuteAction extends ModerationAction {
  async exec() {
    await this.unmute();
  }

  async unmute() {
    // 1. Update the Database
    try {
      const user = await ConvictedUser.findOneAndUpdate({ memberId: this.data.victim.id }, { lastMuteId: null });
      await Sanction.findOneAndUpdate(
        { id: user.lastMuteId },
        {
          $set: { revoked: true },
          $push: {
            updates: {
              date: this.data.start,
              moderator: this.data.moderator?.id,
              type: constants.SANCTIONS.UPDATES.REVOKED,
              reason: this.data.reason,
            },
          },
        },
      );
    } catch (error) {
      this.errorState.addError(
        new ModerationError()
          .from(error)
          .setMessage('An error occured while revoking a mute in the Database')
          .addDetail('Unmute ID', this.data.id)
          .addDetail('Is User', this.data.victim.user instanceof User)
          .addDetail('User ID', this.data.victim.id)
          .addDetail('Unmute Reason', this.data.reason),
      );
    }

    // 2. Unmute (remove roles)
    const role = this.data.guild.roles.resolve(settings.roles.mute);
    try {
      this.data.victim.member?.roles.remove(role, this.data.reason);
    } catch (error) {
      this.errorState.addError(
        new ModerationError()
          .from(error)
          .setMessage('An error occured while fetching unmute a member (removing roles)')
          .addDetail('Victim: GuildMember', this.data.victim.member instanceof GuildMember)
          .addDetail('Victim: User', this.data.victim.user instanceof User)
          .addDetail('Victim: ID', this.data.victim.id)
          .addDetail('Manage Roles Permission', this.data.guild.me.hasPermission(Permissions.FLAGS.MANAGE_ROLES)),
      );
    }
  }
}

export default UnmuteAction;

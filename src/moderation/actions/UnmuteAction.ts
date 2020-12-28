import { GuildMember, User, Permissions } from 'discord.js';
import settings from '../../../config/settings';
import ConvictedUser from '../../models/convictedUser';
import Sanction from '../../models/sanction';
import { SanctionsUpdates } from '../../types';
import ModerationError from '../ModerationError';
import ModerationAction from './ModerationAction';

class UnmuteAction extends ModerationAction {
  protected before(): void { /* */ }

  protected after(): void { /* */ }

  protected async exec(): Promise<void> {
    await this._unmute();
  }

  private async _unmute(): Promise<void> {
    // 1. Update the Database
    try {
      const user = await ConvictedUser.findOneAndUpdate({ memberId: this.data.victim.id }, { lastMuteId: null });
      await Sanction.findOneAndUpdate(
        { sanctionId: user.lastMuteId },
        {
          $set: { revoked: true },
          $push: {
            updates: {
              date: this.data.start,
              moderator: this.data.moderator?.id,
              type: SanctionsUpdates.Revoked,
              reason: this.data.reason,
            },
          },
        },
      );
    } catch (unknownError: unknown) {
      this.errorState.addError(
        new ModerationError()
          .from(unknownError as Error)
          .setMessage('An error occured while revoking a mute in the Database')
          .addDetail('Unmute ID', this.data.sanctionId)
          .addDetail('Is User', this.data.victim.user instanceof User)
          .addDetail('User ID', this.data.victim.id)
          .addDetail('Unmute Reason', this.data.reason),
      );
    }

    // 2. Unmute (remove roles)
    const role = this.data.guild.roles.resolve(settings.roles.mute);
    try {
      await this.data.victim.member?.roles.remove(role, this.data.reason);
    } catch (unknownError: unknown) {
      this.errorState.addError(
        new ModerationError()
          .from(unknownError as Error)
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

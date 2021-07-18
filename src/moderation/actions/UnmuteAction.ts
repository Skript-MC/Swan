import { GuildMember, Permissions, User } from 'discord.js';
import ConvictedUser from '@/app/models/convictedUser';
import Sanction from '@/app/models/sanction';
import ModerationError from '@/app/moderation/ModerationError';
import { SanctionsUpdates } from '@/app/types';
import settings from '@/conf/settings';
import ModerationAction from './ModerationAction';

export default class UnmuteAction extends ModerationAction {
  protected before: undefined;
  protected after: undefined;

  protected override async run(): Promise<void> {
    await this._unmute();
  }

  private async _unmute(): Promise<void> {
    // 1. Update the Database
    try {
      const user = await ConvictedUser.findOneAndUpdate({ memberId: this.data.victim.id }, { currentMuteId: null });
      if (!user)
        throw new TypeError('The user to unmute was not found in the database.');

      await Sanction.findOneAndUpdate(
        { sanctionId: user.currentMuteId },
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
          .setMessage('An error occurred while revoking a mute in the Database')
          .addDetail('Unmute ID', this.data.sanctionId)
          .addDetail('Is User', this.data.victim.user instanceof User)
          .addDetail('User ID', this.data.victim.id)
          .addDetail('Unmute Reason', this.data.reason),
      );
    }

    // 2. Unmute (remove roles)
    try {
      const role = this.data.guild.roles.resolve(settings.roles.mute);
      if (role)
        await this.data.victim.member?.roles.remove(role, this.data.reason);
      else
        throw new TypeError('Unable to resolve the mute role.');
    } catch (unknownError: unknown) {
      this.errorState.addError(
        new ModerationError()
          .from(unknownError as Error)
          .setMessage('An error occurred while fetching unmute a member (removing roles)')
          .addDetail('Victim: GuildMember', this.data.victim.member instanceof GuildMember)
          .addDetail('Victim: User', this.data.victim.user instanceof User)
          .addDetail('Victim: ID', this.data.victim.id)
          .addDetail('Manage Roles Permission', this.data.guild.me?.hasPermission(Permissions.FLAGS.MANAGE_ROLES)),
      );
    }
  }
}

import { GuildMember, User, Permissions } from 'discord.js';
import ConvictedUser from '../../models/convictedUser';
import Sanction from '../../models/sanction';
import type { SanctionDocument } from '../../types/documents';
import { SanctionCreations, SanctionsUpdates } from '../../types/sanctionsTypes';
import { noop } from '../../utils';
import ModerationError from '../ModerationError';
import ModerationHelper from '../ModerationHelper';
import ModerationAction from './ModerationAction';

class UnbanAction extends ModerationAction {
  protected before(): void {
    this.client.currentlyUnbanning.push(this.data.victim.id);
  }

  protected after(): void {
    this.client.currentlyUnbanning.splice(this.client.currentlyUnbanning.indexOf(this.data.victim.id), 1);
  }

  protected async exec(): Promise<void> {
    await this._unban();
  }

  private async _unban(): Promise<void> {
    let ban: SanctionDocument;
    // 1. Update the Database
    try {
      const user = await ConvictedUser.findOneAndUpdate({ memberId: this.data.victim.id }, { lastBanId: null });
      ban = await Sanction.findOneAndUpdate(
        { id: user.lastBanId },
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
          .setMessage('An error occured while revoking a ban in the Database')
          .addDetail('Ban: ID', this.data.id)
          .addDetail('Victim: ID', this.data.victim.id)
          .addDetail('Unban Reason', this.data.reason),
      );
    }

    // 2. Unban (hard-unban or remove roles)
    try {
      if (ban.type === SanctionCreations.Hardban || !this.data.victim.member) {
        const isHardbanned = await this.data.guild.fetchBan(this.data.victim.id).catch(noop);
        if (isHardbanned)
          await this.data.guild.members.unban(this.data.victim.id, this.data.reason);
      } else if (ban.type === SanctionCreations.Ban) {
        await this.data.victim.member.roles.set([]);
        // TODO: Find channel by id (which will be stored in the database, in the "ban" object)
        await ModerationHelper.removeChannel(this.data);
      }
    } catch (unknownError: unknown) {
      this.errorState.addError(
        new ModerationError()
          .from(unknownError as Error)
          .setMessage('An error occured while fetching ban/unbanning/fetching messages/removing channel')
          .addDetail('Victim: GuildMember', this.data.victim.member instanceof GuildMember)
          .addDetail('Victim: User', this.data.victim.user instanceof User)
          .addDetail('Victim: ID', this.data.victim.id)
          .addDetail('Manage Channel Permission', this.data.guild.me.hasPermission(Permissions.FLAGS.MANAGE_CHANNELS)),
      );
    }
  }
}

export default UnbanAction;

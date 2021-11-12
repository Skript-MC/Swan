import type { GuildChannel } from 'discord.js';
import { GuildMember, Permissions, User } from 'discord.js';
import ConvictedUser from '@/app/models/convictedUser';
import Sanction from '@/app/models/sanction';
import ModerationError from '@/app/moderation/ModerationError';
import ModerationHelper from '@/app/moderation/ModerationHelper';
import ModerationAction from '@/app/moderation/actions/ModerationAction';
import type { GuildTextBasedChannel, SanctionDocument } from '@/app/types';
import { SanctionsUpdates, SanctionTypes } from '@/app/types';
import { noop } from '@/app/utils';

export default class UnbanAction extends ModerationAction {
  protected before(): void {
    this.client.currentlyUnbanning.add(this.data.victim.id);
  }

  protected after(): void {
    this.client.currentlyUnbanning.delete(this.data.victim.id);
    this.client.cache.convictedUsers
      .splice(this.client.cache.convictedUsers.findIndex(elt => elt.memberId === this.data.victim.id), 1);
  }

  protected async exec(): Promise<void> {
    await this._unban();
  }

  private async _unban(): Promise<void> {
    let ban: SanctionDocument | null = null;
    // 1. Update the Database
    try {
      const user = await ConvictedUser.findOneAndUpdate({ memberId: this.data.victim.id }, { currentBanId: null });
      if (!user)
        throw new TypeError('The user to unban was not found in the database.');

      ban = await Sanction.findOneAndUpdate(
        { sanctionId: user.currentBanId },
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
          .setMessage('An error occurred while revoking a ban in the Database')
          .addDetail('Ban: ID', this.data.sanctionId)
          .addDetail('Victim: ID', this.data.victim.id)
          .addDetail('Unban Reason', this.data.reason),
      );
    }

    // 2. Unban (hard-unban or remove roles)
    try {
      if (ban?.type === SanctionTypes.Hardban || !this.data.victim.member) {
        const isHardbanned = await this.data.guild.bans.fetch(this.data.victim.id).catch(noop);
        if (isHardbanned)
          await this.data.guild.members.unban(this.data.victim.id, this.data.reason);
      } else {
        await ModerationHelper.removeAllRoles(this.data.victim.member);

        const channelId = ban?.informations?.banChannelId;
        if (!channelId)
          return;
        const channel = this.data.guild.channels.resolve(channelId) as GuildChannel;
        if (!channel || !channel.isText())
          return;

        const messages = await ModerationHelper.getAllChannelMessages(channel as GuildTextBasedChannel);
        const fileInfo = await ModerationHelper.getMessageFile(this.data, messages);
        this.data.setFile(fileInfo);

        await channel.delete();
      }
    } catch (unknownError: unknown) {
      this.errorState.addError(
        new ModerationError()
          .from(unknownError as Error)
          .setMessage('An error occurred while fetching ban/unbanning/fetching messages/removing channel')
          .addDetail('Victim: GuildMember', this.data.victim.member instanceof GuildMember)
          .addDetail('Victim: User', this.data.victim.user instanceof User)
          .addDetail('Victim: ID', this.data.victim.id)
          .addDetail('Manage Channel Permission', this.data.guild.me?.permissions.has(Permissions.FLAGS.MANAGE_CHANNELS)),
      );
    }
  }
}

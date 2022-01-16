import type { TextChannel } from 'discord.js';
import {
 Formatters, GuildMember, Permissions, User,
} from 'discord.js';
import pupa from 'pupa';
import ConvictedUser from '@/app/models/convictedUser';
import Sanction from '@/app/models/sanction';
import ModerationError from '@/app/moderation/ModerationError';
import ModerationHelper from '@/app/moderation/ModerationHelper';
import ModerationAction from '@/app/moderation/actions/ModerationAction';
import { SanctionsUpdates } from '@/app/types';
import { noop } from '@/app/utils';
import messages from '@/conf/messages';
import settings from '@/conf/settings';

export default class BanAction extends ModerationAction {
  protected before(): void {
    this.client.currentlyBanning.add(this.data.victim.id);
  }

  protected after(): void {
    this.client.currentlyBanning.delete(this.data.victim.id);
    this.client.cache.convictedUsers
      .splice(this.client.cache.convictedUsers.findIndex(elt => elt.memberId === this.data.victim.id), 1);
  }

  protected async exec(): Promise<void> {
    if (!this.data.duration)
      throw new TypeError('Unexpected missing property: data.duration is not set.');

    if (this.data.duration === -1)
      await this._hardban();
    else if (this.updateInfos.isUpdate())
      await this._updateBan();
    else
      await this._ban();
  }

  private async _hardban(): Promise<void> {
    await (this.data.victim.member ?? this.data.victim.user)
      ?.send('https://tenor.com/view/cosmic-ban-ban-hammer-gif-14966695')
      .catch(noop);

    // 1. Add/Update the database
    try {
      if (this.updateInfos.isUpdate()) {
        this.client.cache.channelBannedSilentUsers.delete(this.data.victim.id);
        await Sanction.findOneAndUpdate(
          { memberId: this.data.victim.id, sanctionId: this.updateInfos.userDocument.currentBanId },
          {
            $set: {
              duration: this.data.duration,
              finish: null,
            },
            $push: {
              updates: {
                date: this.data.start,
                moderator: this.data.moderatorId,
                type: SanctionsUpdates.Duration,
                valueBefore: this.updateInfos.sanctionDocument.duration,
                valueAfter: this.data.duration,
                reason: this.data.reason,
              },
            },
          },
        );
      } else {
        const user = await ConvictedUser.findOneAndUpdate(
          { memberId: this.data.victim.id },
          { currentBanId: this.data.sanctionId },
          { upsert: true, new: true },
        );
        await Sanction.create({ ...this.data.toSchema(), user: user._id });
      }
    } catch (unknownError: unknown) {
      this.errorState.addError(
        new ModerationError()
          .from(unknownError as Error)
          .setMessage('An error occurred while inserting ban to database')
          .addDetail('Victim: GuildMember', this.data.victim.member instanceof GuildMember)
          .addDetail('Victim: User', this.data.victim.user instanceof User)
          .addDetail('Victim: ID', this.data.victim.id),
      );
    }

    // 2. If it is an update, save the messages
    if (this.updateInfos.isUpdate()) {
      const channelId = this.updateInfos.sanctionDocument?.informations?.banChannelId;
      if (channelId) {
        const channel = this.data.guild.channels.resolve(channelId);
        if (channel?.isText()) {
          const allMessages = await ModerationHelper.getAllChannelMessages(channel);
          const fileInfo = await ModerationHelper.getMessageFile(this.data, allMessages);
          this.data.setFile(fileInfo);

          await channel.delete();
        }
      }
    }

    // 3. Ban the member
    try {
      await this.data.victim.member?.ban({ days: this.data.shouldPurge ? 7 : 0, reason: this.data.reason });
    } catch (unknownError: unknown) {
      this.errorState.addError(
        new ModerationError()
          .from(unknownError as Error)
          .setMessage('Swan does not have sufficient permissions to ban a GuildMember')
          .addDetail('Victim: GuildMember', this.data.victim.member instanceof GuildMember)
          .addDetail('Victim: User', this.data.victim.user instanceof User)
          .addDetail('Victim: ID', this.data.victim.id)
          .addDetail('Ban Member Permission', this.data.guild.me?.permissions.has(Permissions.FLAGS.BAN_MEMBERS)),
      );
    }
  }

  private async _updateBan(): Promise<void> {
    // Update the database
    try {
      await Sanction.findOneAndUpdate(
        { memberId: this.data.victim.id, sanctionId: this.updateInfos.userDocument.currentBanId },
        {
          $set: {
            duration: this.data.duration,
            finish: this.updateInfos.sanctionDocument.start + this.data.duration,
          },
          $push: {
            updates: {
              date: this.data.start,
              moderator: this.data.moderatorId,
              type: SanctionsUpdates.Duration,
              valueBefore: this.updateInfos.sanctionDocument.duration,
              valueAfter: this.data.duration,
              reason: this.data.reason,
            },
          },
        },
      );
    } catch (unknownError: unknown) {
      this.errorState.addError(
        new ModerationError()
          .from(unknownError as Error)
          .setMessage('An error occurred while inserting ban to database')
          .addDetail('Victim: GuildMember', this.data.victim.member instanceof GuildMember)
          .addDetail('Victim: User', this.data.victim.user instanceof User)
          .addDetail('Victim: ID', this.data.victim.id),
      );
    }
  }

  private async _ban(): Promise<void> {
    // 1. Create the private channel
    let channel: TextChannel;
    try {
      channel = await ModerationHelper.getOrCreateChannel(this.data);
      this.data.setInformations({ banChannelId: channel.id });

      const explanation = pupa(messages.moderation.banExplanation, {
        ...this,
        duration: this.formatDuration(this.data.duration),
        expiration: Formatters.time(Math.round(this.data.finish / 1000), Formatters.TimestampStyles.LongDateTime),
      });
      const message = await channel.send(explanation).catch(noop);
      if (message)
        await message.pin().catch(noop);
    } catch (unknownError: unknown) {
      this.errorState.addError(
        new ModerationError()
          .from(unknownError as Error)
          .setMessage('Swan does not have sufficient permissions to create/get a TextChannel')
          .addDetail('Manage Channel Permissions', this.data.guild.me?.permissions.has(Permissions.FLAGS.MANAGE_CHANNELS)),
      );
    }

    // 2. Add to the database
    try {
      this.client.cache.channelBannedSilentUsers.add(this.data.victim.id);
      const user = await ConvictedUser.findOneAndUpdate(
        { memberId: this.data.victim.id },
        { currentBanId: this.data.sanctionId },
        { upsert: true, new: true },
      );
      await Sanction.create({
        ...this.data.toSchema(),
        informations: {
          ...this.data.informations,
          hasSentMessages: false,
        },
        user: user._id,
      });
    } catch (unknownError: unknown) {
      this.errorState.addError(
        new ModerationError()
          .from(unknownError as Error)
          .setMessage('An error occurred while inserting ban to database')
          .addDetail('Victim: GuildMember', this.data.victim.member instanceof GuildMember)
          .addDetail('Victim: User', this.data.victim.user instanceof User)
          .addDetail('Victim: ID', this.data.victim.id),
      );
    }

    // 3. Add needed roles
    try {
      const role = this.data.guild.roles.resolve(settings.roles.ban);
      if (role) {
        if (this.data.victim.member) {
          await ModerationHelper.removeAllRoles(this.data.victim.member);
          await this.data.victim.member.roles.add(role);
        }
      } else {
        throw new TypeError('Unable to resolve the ban role.');
      }
    } catch (unknownError: unknown) {
      this.errorState.addError(
        new ModerationError()
          .from(unknownError as Error)
          .setMessage('Swan does not have sufficient permissions to edit GuildMember roles')
          .addDetail('Victim: GuildMember', this.data.victim.member instanceof GuildMember)
          .addDetail('Victim: User', this.data.victim.user instanceof User)
          .addDetail('Victim: ID', this.data.victim.id)
          .addDetail('Manage Role Permissions', this.data.guild.me?.permissions.has(Permissions.FLAGS.MANAGE_ROLES)),
      );
    }
  }
}

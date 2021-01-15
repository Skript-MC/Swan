import { GuildMember, Permissions, User } from 'discord.js';
import type { TextChannel } from 'discord.js';
import pupa from 'pupa';
import messages from '../../../config/messages';
import settings from '../../../config/settings';
import ConvictedUser from '../../models/convictedUser';
import Sanction from '../../models/sanction';
import { SanctionsUpdates } from '../../types';
import { noop } from '../../utils';
import ModerationError from '../ModerationError';
import ModerationHelper from '../ModerationHelper';
import ModerationAction from './ModerationAction';

class BanAction extends ModerationAction {
  protected before(): void {
    this.client.currentlyBanning.push(this.data.victim.id);
  }

  protected after(): void {
    this.client.currentlyBanning.splice(this.client.currentlyBanning.indexOf(this.data.victim.id), 1);
  }

  protected async exec(): Promise<void> {
    if (this.data.duration === -1)
      await this._hardban();
    else if (this.updateInfos.isUpdate())
      await this._reban();
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
        await Sanction.findOneAndUpdate(
          { memberId: this.data.victim.id, sanctionId: this.updateInfos.userDocument.lastBanId },
          {
            $set: {
              duration: this.data.duration,
              finish: null,
            },
            $push: {
              updates: {
                date: this.data.start,
                moderator: this.data.moderator?.id,
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
          { lastBanId: this.data.sanctionId },
          { upsert: true, new: true },
        );
        await Sanction.create({ ...this.data.toSchema(), user: user._id });
      }
    } catch (unknownError: unknown) {
      this.errorState.addError(
        new ModerationError()
          .from(unknownError as Error)
          .setMessage('An error occured while inserting ban to database')
          .addDetail('Victim: GuildMember', this.data.victim.member instanceof GuildMember)
          .addDetail('Victim: User', this.data.victim.user instanceof User)
          .addDetail('Victim: ID', this.data.victim.id),
      );
    }

    // 2. Ban the member
    try {
      await this.data.victim.member?.ban({ reason: this.data.reason });
    } catch (unknownError: unknown) {
      this.errorState.addError(
        new ModerationError()
          .from(unknownError as Error)
          .setMessage('Swan does not have sufficient permissions to ban a GuildMember')
          .addDetail('Victim: GuildMember', this.data.victim.member instanceof GuildMember)
          .addDetail('Victim: User', this.data.victim.user instanceof User)
          .addDetail('Victim: ID', this.data.victim.id)
          .addDetail('Ban Member Permission', this.data.guild.me.hasPermission(Permissions.FLAGS.BAN_MEMBERS)),
      );
    }
  }

  private async _reban(): Promise<void> {
    // Update the database
    try {
      await Sanction.findOneAndUpdate(
        { memberId: this.data.victim.id, sanctionId: this.updateInfos.userDocument.lastBanId },
        {
          $set: {
            duration: this.data.duration,
            finish: this.updateInfos.sanctionDocument.start + this.data.duration,
          },
          $push: {
            updates: {
              date: this.data.start,
              moderator: this.data.moderator?.id,
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
          .setMessage('An error occured while inserting ban to database')
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
        action: this,
        duration: this.formatDuration(this.data.duration),
      });
      const message = await channel.send(explanation).catch(noop);
      if (message)
        await message.pin().catch(noop);
    } catch (unknownError: unknown) {
      this.errorState.addError(
        new ModerationError()
          .from(unknownError as Error)
          .setMessage('Swan does not have sufficient permissions to create/get a TextChannel')
          .addDetail('Manage Channel Permissions', this.data.guild.me.hasPermission(Permissions.FLAGS.MANAGE_CHANNELS)),
      );
    }

    // 2. Add to the database
    try {
      const user = await ConvictedUser.findOneAndUpdate(
        { memberId: this.data.victim.id },
        { lastBanId: this.data.sanctionId },
        { upsert: true, new: true },
      );
      await Sanction.create({ ...this.data.toSchema(), user: user._id });
    } catch (unknownError: unknown) {
      this.errorState.addError(
        new ModerationError()
          .from(unknownError as Error)
          .setMessage('An error occured while inserting ban to database')
          .addDetail('Victim: GuildMember', this.data.victim.member instanceof GuildMember)
          .addDetail('Victim: User', this.data.victim.user instanceof User)
          .addDetail('Victim: ID', this.data.victim.id),
      );
    }

    // 3. Add needed roles
    try {
      const role = this.data.guild.roles.resolve(settings.roles.ban);
      await this.data.victim.member?.roles.set([role]);
    } catch (unknownError: unknown) {
      this.errorState.addError(
        new ModerationError()
          .from(unknownError as Error)
          .setMessage('Swan does not have sufficient permissions to edit GuildMember roles')
          .addDetail('Victim: GuildMember', this.data.victim.member instanceof GuildMember)
          .addDetail('Victim: User', this.data.victim.user instanceof User)
          .addDetail('Victim: ID', this.data.victim.id)
          .addDetail('Manage Role Permissions', this.data.guild.me.hasPermission(Permissions.FLAGS.MANAGE_ROLES)),
      );
    }
  }
}

export default BanAction;

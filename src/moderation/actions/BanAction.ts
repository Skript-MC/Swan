import {
  GuildMember,
  PermissionsBitField,
  time as timeFormatter,
  TimestampStyles,
  User,
} from 'discord.js';
import pupa from 'pupa';
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
        await Sanction.findOneAndUpdate(
          { userId: this.data.victim.id, sanctionId: this.data.sanctionId },
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
        await Sanction.create({ ...this.data.toSchema(), userId: this.data.victim.id });
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

    // 2. Ban the member
    try {
      await this.data.victim.member?.ban({
        reason: this.data.reason,
      });
    } catch (unknownError: unknown) {
      this.errorState.addError(
        new ModerationError()
          .from(unknownError as Error)
          .setMessage('Swan does not have sufficient permissions to ban a GuildMember')
          .addDetail('Victim: GuildMember', this.data.victim.member instanceof GuildMember)
          .addDetail('Victim: User', this.data.victim.user instanceof User)
          .addDetail('Victim: ID', this.data.victim.id)
          .addDetail('Ban Member Permission', this.data.guild.members.me?.permissions.has(PermissionsBitField.Flags.BanMembers)),
      );
    }
  }

  private async _updateBan(): Promise<void> {
    // Update the database
    try {
      await Sanction.findOneAndUpdate(
        { userId: this.data.victim.id, sanctionId: this.data.sanctionId },
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
    try {
      const thread = await ModerationHelper.getThread(this.data, true);

      const explanation = pupa(messages.moderation.banExplanation, {
        nameString: this.nameString,
        reason: this.data.reason,
        duration: this.formatDuration(this.data.duration),
        expiration: timeFormatter(Math.round(this.data.finish / 1000), TimestampStyles.LongDateTime),
      });

      const message = await thread.send(explanation).catch(noop);
      if (message)
        await message.pin().catch(noop);
    } catch (unknownError: unknown) {
      this.errorState.addError(
        new ModerationError()
          .from(unknownError as Error)
          .setMessage('Swan does not have sufficient permissions to create/get a TextChannel')
          .addDetail('Manage Channel Permissions', this.data.guild.members.me?.permissions.has(PermissionsBitField.Flags.ManageChannels)),
      );
    }

    // 2. Add to the database
    try {
      await Sanction.create({
        ...this.data.toSchema(),
        userId: this.data.victim.id,
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
          .addDetail('Manage Role Permissions', this.data.guild.members.me?.permissions.has(PermissionsBitField.Flags.ManageRoles)),
      );
    }
  }
}

import { container } from '@sapphire/pieces';
import { PermissionFlagsBits, TimestampStyles, time as timeFormatter } from 'discord.js';
import pupa from 'pupa';
import * as messages from '#config/messages';
import { roles } from '#config/settings';
import { Sanction } from '#models/sanction';
import { ModerationError } from '#moderation/ModerationError';
import * as ModerationHelper from '#moderation/ModerationHelper';
import { ModerationAction } from '#moderation/actions/ModerationAction';
import { SanctionsUpdates } from '#types/index';
import { noop, nullop } from '#utils/index';

export class BanAction extends ModerationAction {
  protected before(): void {
    this.client.currentlyBanning.add(this.data.victimId);
  }

  protected after(): void {
    this.client.currentlyBanning.delete(this.data.victimId);
  }

  protected async exec(): Promise<void> {
    if (!this.data.duration) throw new TypeError('Unexpected missing property: data.duration is not set.');

    if (this.data.duration === -1) await this._hardban();
    else if (this.updateInfos.isUpdate()) await this._updateBan();
    else await this._ban();
  }

  private async _hardban(): Promise<void> {
    const victim =
      (await container.client.guild.members.fetch(this.data.victimId).catch(nullop)) ??
      (await container.client.users.fetch(this.data.victimId).catch(nullop));
    await victim?.send('https://tenor.com/view/cosmic-ban-ban-hammer-gif-14966695').catch(noop);

    // 1. Add/Update the database
    try {
      if (this.updateInfos.isUpdate()) {
        await Sanction.findOneAndUpdate(
          { userId: this.data.victimId, sanctionId: this.data.sanctionId },
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
        await Sanction.create({
          ...this.data.toSchema(),
          userId: this.data.victimId,
        });
      }
    } catch (unknownError: unknown) {
      this.errorState.addError(
        new ModerationError()
          .from(unknownError as Error)
          .setMessage('An error occurred while inserting ban to database')
          .addDetail('Victim: ID', this.data.victimId),
      );
    }

    // 2. Ban the member
    try {
      await container.client.guild.members.ban(this.data.victimId, {
        reason: this.data.reason,
      });
    } catch (unknownError: unknown) {
      this.errorState.addError(
        new ModerationError()
          .from(unknownError as Error)
          .setMessage('Swan does not have sufficient permissions to ban a GuildMember')
          .addDetail('Victim ID', this.data.victimId)
          .addDetail(
            'Ban Member Permission',
            container.client.guild.members.me?.permissions.has(PermissionFlagsBits.BanMembers),
          ),
      );
    }
  }

  private async _updateBan(): Promise<void> {
    // Update the database
    try {
      await Sanction.findOneAndUpdate(
        { userId: this.data.victimId, sanctionId: this.data.sanctionId },
        {
          $set: {
            duration: this.data.duration,
            finish: (this.updateInfos.sanctionDocument?.start || 0) + this.data.duration,
          },
          $push: {
            updates: {
              date: this.data.start,
              moderator: this.data.moderatorId,
              type: SanctionsUpdates.Duration,
              valueBefore: this.updateInfos.sanctionDocument?.duration || 0,
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
          .addDetail('Victim ID', this.data.victimId),
      );
    }
  }

  private async _ban(): Promise<void> {
    // 1. Add needed roles
    try {
      const role = container.client.guild.roles.resolve(roles.ban);
      if (role) {
        const member = await container.client.guild.members.fetch(this.data.victimId);
        await member.roles.set([role]);
      } else {
        throw new TypeError('Unable to resolve the ban role.');
      }
    } catch (unknownError: unknown) {
      this.errorState.addError(
        new ModerationError()
          .from(unknownError as Error)
          .setMessage('Swan does not have sufficient permissions to edit GuildMember roles')
          .addDetail('Victim ID', this.data.victimId)
          .addDetail(
            'Manage Role Permissions',
            container.client.guild.members.me?.permissions.has(PermissionFlagsBits.ManageRoles),
          ),
      );
    }

    // 2. Create the private channel
    try {
      const thread = await ModerationHelper.getThread(this.data, true);

      const explanation = pupa(messages.moderation.banExplanation, {
        nameString: this.nameString,
        reason: this.data.reason,
        duration: this.formatDuration(this.data.duration),
        expiration: timeFormatter(Math.round(this.data.finish / 1000), TimestampStyles.LongDateTime),
      });

      const message = await thread.send(explanation);
      if (message) await message.pin().catch(noop);
    } catch (unknownError: unknown) {
      this.errorState.addError(
        new ModerationError()
          .from(unknownError as Error)
          .setMessage('Swan does not have sufficient permissions to create/get a TextChannel')
          .addDetail(
            'Manage Channels Permissions',
            container.client.guild.members.me?.permissions.has(PermissionFlagsBits.ManageChannels),
          )
          .addDetail(
            'Manage Threads Permissions',
            container.client.guild.members.me?.permissions.has(PermissionFlagsBits.ManageThreads),
          )
          .addDetail(
            'Create Private Threads Permissions',
            container.client.guild.members.me?.permissions.has(PermissionFlagsBits.CreatePrivateThreads),
          )
          .addDetail(
            'Send Messages In Threads Permissions',
            container.client.guild.members.me?.permissions.has(PermissionFlagsBits.SendMessagesInThreads),
          ),
      );
    }

    // 3. Add to the database
    try {
      await Sanction.create({
        ...this.data.toSchema(),
        userId: this.data.victimId,
      });
    } catch (unknownError: unknown) {
      this.errorState.addError(
        new ModerationError()
          .from(unknownError as Error)
          .setMessage('An error occurred while inserting ban to database')
          .addDetail('Victim ID', this.data.victimId),
      );
    }
  }
}

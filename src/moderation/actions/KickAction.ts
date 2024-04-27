import { container } from '@sapphire/pieces';
import { PermissionFlagsBits } from 'discord.js';
import { Sanction } from '#models/sanction';
import { ModerationError } from '#moderation/ModerationError';
import { ModerationAction } from '#moderation/actions/ModerationAction';

export class KickAction extends ModerationAction {
  protected before: undefined;
  protected after: undefined;

  protected async exec(): Promise<void> {
    await this._kick();
  }

  private async _kick(): Promise<void> {
    // 1. Add to the database
    try {
      await Sanction.create({
        ...this.data.toSchema(),
        userId: this.data.victimId,
      });
    } catch (unknownError: unknown) {
      this.errorState.addError(
        new ModerationError()
          .from(unknownError as Error)
          .setMessage('An error occurred while inserting kick to database')
          .addDetail('Victim ID', this.data.victimId),
      );
    }

    // 2. Kick the member
    try {
      await container.client.guild.members.kick(
        this.data.victimId,
        this.data.reason,
      );
    } catch (unknownError: unknown) {
      this.errorState.addError(
        new ModerationError()
          .from(unknownError as Error)
          .setMessage(
            'Swan does not have sufficient permissions to kick a GuildMember',
          )
          .addDetail('Victim ID', this.data.victimId)
          .addDetail(
            'Kick Member Permission',
            container.client.guild.members.me?.permissions.has(
              PermissionFlagsBits.KickMembers,
            ),
          ),
      );
    }
  }
}

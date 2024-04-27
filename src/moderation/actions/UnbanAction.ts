import { container } from '@sapphire/pieces';
import { Sanction } from '#models/sanction';
import { ModerationError } from '#moderation/ModerationError';
import * as ModerationHelper from '#moderation/ModerationHelper';
import { ModerationAction } from '#moderation/actions/ModerationAction';
import type { SanctionDocument } from '#types/index';
import { SanctionTypes, SanctionsUpdates } from '#types/index';
import { nullop } from '#utils/index';

export class UnbanAction extends ModerationAction {
  protected before(): void {
    this.client.currentlyUnbanning.add(this.data.victimId);
  }

  protected after(): void {
    this.client.currentlyUnbanning.delete(this.data.victimId);
  }

  protected async exec(): Promise<void> {
    await this._unban();
  }

  private async _unban(): Promise<void> {
    let ban: SanctionDocument | null = null;
    // 1. Update the database
    try {
      ban = await Sanction.findOneAndUpdate(
        { sanctionId: this.data.sanctionId },
        {
          $set: { revoked: true },
          $push: {
            updates: {
              date: this.data.start,
              moderator: this.data.moderatorId,
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
          .setMessage('An error occurred while revoking a ban in the database')
          .addDetail('Ban: ID', this.data.sanctionId)
          .addDetail('Victim ID', this.data.victimId)
          .addDetail('Unban Reason', this.data.reason),
      );
    }

    // 2. Unban (hard-unban or remove roles)
    try {
      const member = await container.client.guild.members
        .fetch(this.data.victimId)
        .catch(nullop);
      if (ban?.type === SanctionTypes.Hardban || !member) {
        const isHardbanned = await container.client.guild.bans
          .fetch(this.data.victimId)
          .catch(nullop);
        if (isHardbanned)
          await container.client.guild.members.unban(
            this.data.victimId,
            this.data.reason,
          );
      } else {
        await member.roles.set([]);
      }
    } catch (unknownError: unknown) {
      this.errorState.addError(
        new ModerationError()
          .from(unknownError as Error)
          .setMessage('An error occurred while fetching ban/unbanning')
          .addDetail('Victim ID', this.data.victimId),
      );
    }

    // 3. Archive the thread
    try {
      const thread = await ModerationHelper.getThread(this.data, false);
      if (thread) {
        await thread.setLocked(true);
        await thread.setArchived(true);
      }
    } catch (unknownError: unknown) {
      this.errorState.addError(
        new ModerationError()
          .from(unknownError as Error)
          .setMessage('An error occurred while archiving the thread.')
          .addDetail('Sanction: ID', this.data.sanctionId),
      );
    }
  }
}

import { GuildMember, User } from 'discord.js';
import { Sanction } from '#models/sanction';
import { ModerationError } from '#moderation/ModerationError';
import { ModerationAction } from '#moderation/actions/ModerationAction';

export class MuteAction extends ModerationAction {
  protected before: undefined;
  protected after: undefined;

  protected async exec(): Promise<void> {
    if (!this.data.duration)
      throw new TypeError('Unexpected missing property: data.duration is not set.');

    await this._mute();
  }

  private async _mute(): Promise<void> {
    // Add to the database
    try {
      await Sanction.create({ ...this.data.toSchema(), userId: this.data.victim.id });
    } catch (unknownError: unknown) {
      this.errorState.addError(
        new ModerationError()
          .from(unknownError as Error)
          .setMessage('An error occurred while inserting mute to database')
          .addDetail('Victim: GuildMember', this.data.victim.member instanceof GuildMember)
          .addDetail('Victim: User', this.data.victim.user instanceof User)
          .addDetail('Victim: ID', this.data.victim.id),
      );
    }
  }
}

import { GuildMember, Permissions, User } from 'discord.js';
import ConvictedUser from '@/app/models/convictedUser';
import Sanction from '@/app/models/sanction';
import ModerationError from '@/app/moderation/ModerationError';
import ModerationAction from './ModerationAction';

class KickAction extends ModerationAction {
  protected before(): void { /* */ }

  protected after(): void { /* */ }

  protected async exec(): Promise<void> {
    await this._kick();
  }

  private async _kick(): Promise<void> {
    // 1. Add to the database
    try {
      const user = await ConvictedUser.findOneOrCreate(
        { memberId: this.data.victim.id },
        { memberId: this.data.victim.id },
      );
      await Sanction.create({ ...this.data.toSchema(), user: user._id });
    } catch (unknownError: unknown) {
      this.errorState.addError(
        new ModerationError()
          .from(unknownError as Error)
          .setMessage('An error occured while inserting kick to database')
          .addDetail('Victim: GuildMember', this.data.victim.member instanceof GuildMember)
          .addDetail('Victim: User', this.data.victim.user instanceof User)
          .addDetail('Victim: ID', this.data.victim.id),
      );
    }

    // 2. Kick the member
    try {
      await this.data.victim.member?.kick(this.data.reason);
    } catch (unknownError: unknown) {
      this.errorState.addError(
        new ModerationError()
          .from(unknownError as Error)
          .setMessage('Swan does not have sufficient permissions to kick a GuildMember')
          .addDetail('Victim: GuildMember', this.data.victim.member instanceof GuildMember)
          .addDetail('Victim: User', this.data.victim.user instanceof User)
          .addDetail('Victim: ID', this.data.victim.id)
          .addDetail('Kick Member Permission', this.data.guild.me.hasPermission(Permissions.FLAGS.KICK_MEMBERS)),
      );
    }
  }
}

export default KickAction;

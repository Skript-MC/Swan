import {
  GuildMember,
  Permissions,
  User,
} from 'discord.js';
import settings from '../../../config/settings';
import ConvictedUser from '../../models/convictedUser';
import Sanction from '../../models/sanction';
import { SanctionsUpdates } from '../../types';
import ModerationError from '../ModerationError';
import ModerationAction from './ModerationAction';

class MuteAction extends ModerationAction {
  protected before(): void { /* */ }

  protected after(): void { /* */ }

  protected async exec(): Promise<void> {
    if (!this.data.duration)
      throw new TypeError('Unexpected missing property: data.duration is not set.');

    // eslint-disable-next-line unicorn/prefer-ternary
    if (this.updateInfos.isUpdate())
      await this._remute();
    else
      await this._mute();
  }

  private async _remute(): Promise<void> {
    // Update the database
    try {
      await Sanction.findOneAndUpdate(
        { memberId: this.data.victim.id, sanctionId: this.updateInfos.userDocument.lastMuteId },
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
          .setMessage('An error occured while updating a mute of the database')
          .addDetail('Victim: GuildMember', this.data.victim.member instanceof GuildMember)
          .addDetail('Victim: User', this.data.victim.user instanceof User)
          .addDetail('Victim: ID', this.data.victim.id),
      );
    }
  }

  private async _mute(): Promise<void> {
    // 1. Add to the database
    try {
      const user = await ConvictedUser.findOneAndUpdate(
        { memberId: this.data.victim.id },
        { lastMuteId: this.data.sanctionId },
        { upsert: true, new: true },
      );
      await Sanction.create({ ...this.data.toSchema(), user: user._id });
    } catch (unknownError: unknown) {
      this.errorState.addError(
        new ModerationError()
          .from(unknownError as Error)
          .setMessage('An error occured while inserting mute to database')
          .addDetail('Victim: GuildMember', this.data.victim.member instanceof GuildMember)
          .addDetail('Victim: User', this.data.victim.user instanceof User)
          .addDetail('Victim: ID', this.data.victim.id),
      );
    }

    // 2. Mute the member
    try {
      const role = this.data.guild.roles.resolve(settings.roles.mute);
      if (role)
        await this.data.victim.member?.roles.add(role, this.data.reason);
      else
        throw new TypeError('Unable to resolve the mute role.');
    } catch (unknownError: unknown) {
      this.errorState.addError(
        new ModerationError()
          .from(unknownError as Error)
          .setMessage('Swan does not have sufficient permissions to mute a GuildMember')
          .addDetail('Victim: GuildMember', this.data.victim.member instanceof GuildMember)
          .addDetail('Victim: User', this.data.victim.user instanceof User)
          .addDetail('Victim: ID', this.data.victim.id)
          .addDetail('Role: ID', settings.roles.mute)
          .addDetail('Add Role Permission', this.data.guild.me.hasPermission(Permissions.FLAGS.MANAGE_ROLES)),
      );
    }
  }
}

export default MuteAction;

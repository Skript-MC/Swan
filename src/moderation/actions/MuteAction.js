import {
  Role,
  Permissions,
  User,
  GuildMember,
} from 'discord.js';
import messages from '../../../config/messages';
import settings from '../../../config/settings';
import ConvictedUser from '../../models/convictedUser';
import Sanction from '../../models/sanction';
import ModerationAction from './ModerationAction';

class MuteAction extends ModerationAction {
  async exec() {
    await this.mute();
    return true;
  }

  async mute() {
    // 1. Add to the database
    try {
      const user = await ConvictedUser.findOneAndUpdate(
        { memberId: this.data.victim.id },
        { lastMuteId: this.data.id },
        { upsert: true, new: true },
      );
      await Sanction.create({ ...this.data.toSchema(), user: user._id });
    } catch (error) {
      this.data.channel.send(messages.global.oops);
      this.client.logger.error('An error occured while inserting mute to DB');
      this.client.logger.detail(`Victim: GuildMember=${this.data.victim.member instanceof GuildMember} / User=${this.data.victim.user instanceof User} / ID=${this.data.victim.id}`);
      this.client.logger.error(error.stack);
    }

    // 2. Mute the member
    const role = this.data.guild.roles.resolve(settings.roles.mute);
    try {
      await this.data.victim.member?.roles.add(role, this.data.reason);
    } catch (error) {
      this.data.channel.send(messages.global.oops);
      this.client.logger.error('Swan does not have sufficient permissions to mute a GuildMember');
      this.client.logger.detail(`Victim: GuildMember=${this.data.victim.member instanceof GuildMember} / User=${this.data.victim.user instanceof User} / ID=${this.data.victim.id}`);
      this.client.logger.detail(`Role ID: ${role instanceof Role}`);
      this.client.logger.detail(`Resolved Role: ${settings.roles.mute}`);
      this.client.logger.detail(`Add Roles Permission: ${this.data.guild.me.hasPermission(Permissions.FLAGS.MANAGE_ROLES)}`);
      this.client.logger.error(error.stack);
    }

    this.client.logger.success('Mute finished successfully');
  }
}

export default MuteAction;

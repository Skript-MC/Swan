import { GuildMember, User, Permissions } from 'discord.js';
import messages from '../../../config/messages';
import settings from '../../../config/settings';
import ConvictedUser from '../../models/convictedUser';
import Sanction from '../../models/sanction';
import { constants } from '../../utils';
import ModerationAction from './ModerationAction';

class UnmuteAction extends ModerationAction {
  async exec() {
    await this.unmute();
  }

  async unmute() {
    // 1. Update the Database
    try {
      const user = await ConvictedUser.findOneAndUpdate({ memberId: this.data.victim.id }, { lastMuteId: null });
      await Sanction.findOneAndUpdate(
        { id: user.lastMuteId },
        {
          $set: { revoked: true },
          $push: {
            updates: {
              date: this.data.start,
              moderator: this.data.moderator?.id,
              type: constants.SANCTIONS.UPDATES.REVOKED,
              reason: this.data.reason,
            },
          },
        },
      );
    } catch (error) {
      this.data.channel.send(messages.global.oops);
      this.client.logger.error('An error occured while revoking a mute in the Database');
      this.client.logger.detail(`Ban ID: ${this.data.id}`);
      this.client.logger.detail(`Victim ID: ${this.data.victim.id}`);
      this.client.logger.detail(`Unmute Reason: ${this.data.reason}`);
      this.client.logger.error(error.stack);
    }

    // 2. Unmute (remove roles)
    const role = this.data.guild.roles.resolve(settings.roles.mute);
    try {
      this.data.victim.member?.roles.remove(role, this.data.reason);
    } catch (error) {
      this.data.channel.send(messages.global.oops);
      this.client.logger.error('An error occured while fetching unmute a member (removing roles)');
      this.client.logger.detail(`Victim: GuildMember=${this.data.victim.member instanceof GuildMember} / User=${this.data.victim.user instanceof User} / ID=${this.data.victim.id}`);
      this.client.logger.detail(`Manage Roles Permission: ${this.data.guild.me.hasPermission(Permissions.FLAGS.MANAGE_ROLES)}`);
      this.client.logger.error(error.stack);
    }

    this.client.logger.success('Unmute finished successfully');
  }
}

export default UnmuteAction;

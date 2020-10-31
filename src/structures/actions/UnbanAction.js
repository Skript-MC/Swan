import { GuildMember, User, Permissions } from 'discord.js';
import messages from '../../../config/messages';
import ConvictedUser from '../../models/convictedUser';
import Sanction from '../../models/sanction';
import { constants, noop } from '../../utils';
import ModerationHelper from '../ModerationHelper';
import ModerationAction from './ModerationAction';

class UnbanAction extends ModerationAction {
  before() {
    this.client.currentlyUnbanning.push(this.data.victim.id);
  }

  async exec() {
    await this.unban();
  }

  async unban() {
    let ban;
    // 1. Update the Database
    try {
      const user = await ConvictedUser.findOneAndUpdate({ memberId: this.data.victim.id }, { lastBanId: null });
      ban = await Sanction.findOneAndUpdate(
        { id: user.lastBanId },
        {
          $set: { revoked: true },
          $push: {
            updates: {
              date: this.data.start,
              moderator: this.data.moderator?.id,
              type: constants.SANCTIONS.TYPES.UNBAN,
              reason: this.data.reason,
            },
          },
        },
      );
    } catch (error) {
      this.data.channel.send(messages.global.oops);
      // TODO: Add more details here?
      this.client.logger.error('An error occured while revoking a ban in the Database');
      this.client.logger.error(error.stack);
    }

    // 2. Unban (hard-unban or remove roles)
    try {
      if (ban.type === constants.SANCTIONS.TYPES.HARDBAN || !this.data.victim.member) {
        const isHardbanned = await this.data.guild.fetchBan(this.data.victim.id).catch(noop);
        if (isHardbanned)
          await this.data.guild.members.unban(this.data.victim.id, this.data.reason);
      } else if (ban.type === constants.SANCTIONS.TYPES.BAN) {
        this.data.victim.member.roles.set([]);
        // TODO: Find channel by id (which will be stored in the database, in the "ban" object)
        ModerationHelper.removeChannel(this.data);
      }
    } catch (error) {
      this.data.channel.send(messages.global.oops);
      this.client.logger.error('An error occured while fetching ban/unbanning/removing channel');
      this.client.logger.detail(`Victim: GuildMember=${this.data.victim.member instanceof GuildMember} / User=${this.data.victim.user instanceof User} / ID=${this.data.victim.id}`);
      this.client.logger.detail(`Manage Channel Permission: ${this.data.guild.me.hasPermission(Permissions.FLAGS.MANAGE_CHANNELS)}`);
      this.client.logger.error(error.stack);
    }

    this.client.logger.success('Unban finished successfully');
  }

  after() {
    this.client.currentlyUnbanning.splice(this.client.currentlyUnbanning.indexOf(this.data.victim.id), 1);
  }
}

export default UnbanAction;

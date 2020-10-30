import { Permissions, User, GuildMember } from 'discord.js';
import messages from '../../../config/messages';
import settings from '../../../config/settings';
import ConvictedUser from '../../models/convictedUser';
import Sanction from '../../models/sanction';
import { noop } from '../../utils';
import ModerationHelper from '../ModerationHelper';
import ModerationAction from './ModerationAction';

class BanAction extends ModerationAction {
  async exec() {
    if (this.data.duration === -1)
      await this.hardban();
    else if (this.isUpdate)
      await this.reban();
    else
      await this.ban();
    return true;
  }

  async hardban() {
    await (this.data.victim.member || this.data.victim.user)
      ?.send('https://tenor.com/view/cosmic-ban-ban-hammer-gif-14966695')
      .catch(noop);

    // 1. Add to the database
    try {
      const user = await ConvictedUser.findOneAndUpdate(
        { memberId: this.data.victim.id },
        { lastBanId: this.data.id },
        { upsert: true, new: true },
      );
      await Sanction.create({ ...this.data.toSchema(), user: user._id });
    } catch (error) {
      this.data.channel.send(messages.global.oops);
      this.client.logger.error('An error occured while inserting ban to DB');
      this.client.logger.detail(`Victim: GuildMember=${this.data.victim.member instanceof GuildMember} / User=${this.data.victim.user instanceof User} / ID=${this.data.victim.id}`);
      this.client.logger.error(error.stack);
    }

    // 2. Ban the member
    try {
      await this.data.victim.member?.ban({ reason: this.data.reason });
    } catch (error) {
      this.data.channel.send(messages.global.oops);
      this.client.logger.error('Swan does not have sufficient permissions to ban a GuildMember');
      this.client.logger.detail(`Victim: GuildMember=${this.data.victim.member instanceof GuildMember} / User=${this.data.victim.user instanceof User} / ID=${this.data.victim.id}`);
      this.client.logger.detail(`Ban Member Permission: ${this.data.guild.me.hasPermission(Permissions.FLAGS.BAN_MEMBERS)}`);
      this.client.logger.error(error.stack);
    }

    this.client.logger.success('Bannishment finished successfully');
  }

  async reban() {
    // TODO: implement ban update
    this.client.logger.info('NOT IMPLEMENTED: Reban (ban update)');
  }

  async ban() {
    // 1. Add to the database
    try {
      const user = await ConvictedUser.findOneAndUpdate(
        { memberId: this.data.victim.id },
        { lastBanId: this.data.id },
        { upsert: true, new: true },
      );
      await Sanction.create({ ...this.data.toSchema(), user: user._id });
    } catch (error) {
      this.data.channel.send(messages.global.oops);
      this.client.logger.error('An error occured while inserting ban to DB');
      this.client.logger.detail(`Victim: GuildMember=${this.data.victim.member instanceof GuildMember} / User=${this.data.victim.user instanceof User} / ID=${this.data.victim.id}`);
      this.client.logger.error(error.stack);
    }

    // 2. Add needed roles
    try {
      const role = this.data.guild.roles.resolve(settings.roles.ban);
      await this.data.victim.member?.roles.set([role]);
    } catch (error) {
      this.data.channel.send(messages.global.oops);
      this.client.logger.error('Swan does not have sufficient permissions to edit GuildMember roles');
      this.client.logger.detail(`Victim: GuildMember=${this.data.victim.member instanceof GuildMember} / User=${this.data.victim.user instanceof User} / ID=${this.data.victim.id}`);
      this.client.logger.detail(`Manage Role Permission: ${this.data.guild.me.hasPermission(Permissions.FLAGS.MANAGE_ROLES)}`);
      this.client.logger.error(error.stack);
    }

    // 3. Create the private channel
    let channel;
    try {
      channel = await ModerationHelper.getOrCreateChannel(this.data);
      this.data.setPrivateChannel(channel);

      const explanation = messages.moderation.banExplanation
        .replace('{MEMBER}', this.nameString)
        .replace('{REASON}', this.data.reason)
        .replace('{DURATION}', this.duration)
        .replace('{EXPIRATION}', this.expiration);
      const message = await channel.send(explanation).catch(noop);
      await message.pin().catch(noop);
    } catch (error) {
      this.data.channel.send(messages.global.oops);
      this.client.logger.error('Swan does not have sufficient permissions to create/get a TextChannel');
      this.client.logger.detail(`Manage Channel Permission: ${this.data.guild.me.hasPermission(Permissions.FLAGS.MANAGE_CHANNELS)}`);
      this.client.logger.error(error.stack);
    }

    this.client.logger.success('Bannishment finished successfully');
  }
}

export default BanAction;

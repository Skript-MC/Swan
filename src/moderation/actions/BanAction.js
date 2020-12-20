import { Permissions, User, GuildMember } from 'discord.js';
import messages from '../../../config/messages';
import settings from '../../../config/settings';
import ConvictedUser from '../../models/convictedUser';
import Sanction from '../../models/sanction';
import { constants, noop } from '../../utils';
import ModerationError from '../ModerationError';
import ModerationHelper from '../ModerationHelper';
import ModerationAction from './ModerationAction';

class BanAction extends ModerationAction {
  before() {
    this.client.currentlyBanning.push(this.data.victim.id);
  }

  async exec() {
    if (this.data.duration === -1)
      await this.hardban();
    else if (this.updateInfos.isUpdate())
      await this.reban();
    else
      await this.ban();
    return true;
  }

  async hardban() {
    await (this.data.victim.member || this.data.victim.user)
      ?.send('https://tenor.com/view/cosmic-ban-ban-hammer-gif-14966695')
      .catch(noop);

    // 1. Add/Update to the database
    try {
      if (this.updateInfos.isUpdate()) {
        await Sanction.findOneAndUpdate(
          { memberId: this.data.victim.id, id: this.updateInfos.userDocument.lastBanId },
          {
            $set: {
              duration: this.data.duration,
              finish: null,
            },
            $push: {
              updates: {
                date: this.data.start,
                moderator: this.data.moderator?.id,
                type: constants.SANCTIONS.UPDATES.DURATION,
                valueBefore: this.updateInfos.sanctionDocument.duration,
                valueAfter: this.data.duration,
                reason: this.data.reason,
              },
            },
          },
        );
      } else {
        const user = await ConvictedUser.findOneAndUpdate(
          { memberId: this.data.victim.id },
          { lastBanId: this.data.id },
          { upsert: true, new: true },
        );
        await Sanction.create({ ...this.data.toSchema(), user: user._id });
      }
    } catch (error) {
      this.errorState.addError(
        new ModerationError()
          .from(error)
          .setMessage('An error occured while inserting ban to database')
          .addDetail('Victim: GuildMember', this.data.victim.member instanceof GuildMember)
          .addDetail('Victim: User', this.data.victim.user instanceof User)
          .addDetail('Victim: ID', this.data.victim.id),
      );
    }

    // 2. Ban the member
    try {
      await this.data.victim.member?.ban({ reason: this.data.reason });
    } catch (error) {
      this.errorState.addError(
        new ModerationError()
          .from(error)
          .setMessage('Swan does not have sufficient permissions to ban a GuildMember')
          .addDetail('Victim: GuildMember', this.data.victim.member instanceof GuildMember)
          .addDetail('Victim: User', this.data.victim.user instanceof User)
          .addDetail('Victim: ID', this.data.victim.id)
          .addDetail('Ban Member Permission', this.data.guild.me.hasPermission(Permissions.FLAGS.BAN_MEMBERS)),
      );
    }
  }

  async reban() {
    // Update the database
    try {
      await Sanction.findOneAndUpdate(
        { memberId: this.data.victim.id, id: this.updateInfos.userDocument.lastBanId },
        {
          $set: {
            duration: this.data.duration,
            finish: this.updateInfos.sanctionDocument.start + this.data.duration,
          },
          $push: {
            updates: {
              date: this.data.start,
              moderator: this.data.moderator?.id,
              type: constants.SANCTIONS.UPDATES.DURATION,
              valueBefore: this.updateInfos.sanctionDocument.duration,
              valueAfter: this.data.duration,
              reason: this.data.reason,
            },
          },
        },
      );
    } catch (error) {
      this.errorState.addError(
        new ModerationError()
          .from(error)
          .setMessage('An error occured while inserting ban to database')
          .addDetail('Victim: GuildMember', this.data.victim.member instanceof GuildMember)
          .addDetail('Victim: User', this.data.victim.user instanceof User)
          .addDetail('Victim: ID', this.data.victim.id),
      );
    }
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
      this.errorState.addError(
        new ModerationError()
          .from(error)
          .setMessage('An error occured while inserting ban to database')
          .addDetail('Victim: GuildMember', this.data.victim.member instanceof GuildMember)
          .addDetail('Victim: User', this.data.victim.user instanceof User)
          .addDetail('Victim: ID', this.data.victim.id),
      );
    }

    // 2. Add needed roles
    try {
      const role = this.data.guild.roles.resolve(settings.roles.ban);
      await this.data.victim.member?.roles.set([role]);
    } catch (error) {
      this.errorState.addError(
        new ModerationError()
          .from(error)
          .setMessage('Swan does not have sufficient permissions to edit GuildMember roles')
          .addDetail('Victim: GuildMember', this.data.victim.member instanceof GuildMember)
          .addDetail('Victim: User', this.data.victim.user instanceof User)
          .addDetail('Victim: ID', this.data.victim.id)
          .addDetail('Manage Role Permissions', this.data.guild.me.hasPermission(Permissions.FLAGS.MANAGE_ROLES)),
      );
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
      this.errorState.addError(
        new ModerationError()
          .from(error)
          .setMessage('Swan does not have sufficient permissions to create/get a TextChannel')
          .addDetail('Manage Channel Permissions', this.data.guild.me.hasPermission(Permissions.FLAGS.MANAGE_CHANNELS)),
      );
    }
  }

  after() {
    this.client.currentlyBanning.splice(this.client.currentlyBanning.indexOf(this.data.victim.id), 1);
  }
}

export default BanAction;

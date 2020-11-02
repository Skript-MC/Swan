import { Listener } from 'discord-akairo';
import { Permissions } from 'discord.js';
import messages from '../../../config/messages';
import settings from '../../../config/settings';
import ModerationHelper from '../../structures/ModerationHelper';
import { toValidName, noop } from '../../utils';

class GuildMemberAddListener extends Listener {
  constructor() {
    super('guildMemberAdd', {
      event: 'guildMemberAdd',
      emitter: 'client',
    });
  }

  async remute(member) {
    const isMuted = await ModerationHelper.isMuted(member.id);
    if (isMuted) {
      try {
        const muteRole = member.guild.roles.resolve(settings.roles.mute);
        await member.roles.add(muteRole);
      } catch (error) {
        this.client.logger.error('Could not add the mute role to a member.');
        this.client.logger.detail(`MuteObject: "${JSON.stringify(isMuted)}"`);
        this.client.logger.detail(`Manager roles permission: ${member.guild.me.hasPermission(Permissions.FLAGS.MANAGE_ROLES)}`);
        this.client.logger.error(error.stack);
      }
    }
  }

  async rename(member) {
    const name = member.displayName;
    const strippedName = toValidName(name);
    if (strippedName === name)
      return;

    const requiredPercentage = settings.miscellaneous.validNamePercentage;

    // If the percentage of correct name is >= required percentage
    const newName = Math.round((strippedName.length / name.length) * 100) >= requiredPercentage
      ? strippedName
      : messages.miscellaneous.renameList[Math.floor(Math.random() * messages.miscellaneous.renameList.length)];

    try {
      await member.setNickname(newName);
    } catch (err) {
      this.client.logger.error('Could not rename a member with an invalid name.');
      this.client.logger.detail(`Member's name: "${name}"`);
      this.client.logger.detail(`Stripped name: "${strippedName}"`);
      this.client.logger.detail(`New name: "${newName}"`);
      this.client.logger.detail(`Change nicknames permission: ${member.guild.me.hasPermission(Permissions.FLAGS.MANAGE_NICKNAMES)}`);
      this.client.logger.error(err.stack);
    }

    await member.send(messages.miscellaneous.strangeName).catch(noop);
  }

  async exec(member) {
    await this.remute(member);
    await this.rename(member);
  }
}

export default GuildMemberAddListener;

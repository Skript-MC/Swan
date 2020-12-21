import { Listener } from 'discord-akairo';
import { Permissions } from 'discord.js';
import messages from '../../../config/messages';
import settings from '../../../config/settings';
import ModerationHelper from '../../moderation/ModerationHelper';
import Logger from '../../structures/Logger';
import { toValidName, noop } from '../../utils';

class GuildMemberAddListener extends Listener {
  constructor() {
    super('guildMemberAdd', {
      event: 'guildMemberAdd',
      emitter: 'client',
    });
  }

  async greet(member) {
    const { greetings } = messages.miscellaneous;
    const randomMessage = greetings[Math.floor(Math.random() * greetings.length)];
    await member.guild.channels
      .resolve(settings.channels.main)
      .send(randomMessage.replace(/{MEMBER}/g, member))
      .catch(noop);
  }

  async remute(member) {
    const isMuted = await ModerationHelper.isMuted(member.id);
    if (isMuted) {
      try {
        const muteRole = member.guild.roles.resolve(settings.roles.mute);
        await member.roles.add(muteRole);
      } catch (error) {
        Logger.error('Could not add the mute role to a member.');
        Logger.detail(`MuteObject: "${JSON.stringify(isMuted)}"`);
        Logger.detail(`Manager roles permission: ${member.guild.me.hasPermission(Permissions.FLAGS.MANAGE_ROLES)}`);
        Logger.error(error.stack);
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
      Logger.error('Could not rename a member with an invalid name.');
      Logger.detail(`Member's name: "${name}"`);
      Logger.detail(`Stripped name: "${strippedName}"`);
      Logger.detail(`New name: "${newName}"`);
      Logger.detail(`Change nicknames permission: ${member.guild.me.hasPermission(Permissions.FLAGS.MANAGE_NICKNAMES)}`);
      Logger.error(err.stack);
    }

    await member.send(messages.miscellaneous.strangeName).catch(noop);
  }

  async exec(member) {
    await this.greet(member);
    await this.remute(member);
    await this.rename(member);
  }
}

export default GuildMemberAddListener;

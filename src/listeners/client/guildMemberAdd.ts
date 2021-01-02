import { Listener } from 'discord-akairo';
import { Permissions } from 'discord.js';
import type { GuildChannel, GuildMember } from 'discord.js';
import pupa from 'pupa';
import messages from '../../../config/messages';
import settings from '../../../config/settings';
import ModerationHelper from '../../moderation/ModerationHelper';
import Logger from '../../structures/Logger';
import { noop, toValidName } from '../../utils';

class GuildMemberAddListener extends Listener {
  constructor() {
    super('guildMemberAdd', {
      event: 'guildMemberAdd',
      emitter: 'client',
    });
  }

  public async exec(member: GuildMember): Promise<void> {
    await this._greet(member);
    await this._remute(member);
    await this._rename(member);
  }

  private async _greet(member: GuildMember): Promise<void> {
    const { greetings } = messages.miscellaneous;
    const randomMessage = greetings[Math.floor(Math.random() * greetings.length)];

    const channel: GuildChannel = member.guild.channels.resolve(settings.channels.main);
    if (!channel.isText())
      return;

    const content = pupa(randomMessage, { member });
    await channel.send(content).catch(noop);
  }

  private async _remute(member: GuildMember): Promise<void> {
    const isMuted = await ModerationHelper.isMuted(member.id);
    if (isMuted) {
      try {
        const muteRole = member.guild.roles.resolve(settings.roles.mute);
        await member.roles.add(muteRole);
      } catch (unknownError: unknown) {
        Logger.error('Could not add the mute role to a member.');
        Logger.detail(`MuteObject: "${JSON.stringify(isMuted)}"`);
        Logger.detail(`Manager roles permission: ${member.guild.me.hasPermission(Permissions.FLAGS.MANAGE_ROLES)}`);
        Logger.error((unknownError as Error).stack);
      }
    }
  }

  private async _rename(member: GuildMember): Promise<void> {
    const name = member.displayName;
    const strippedName = toValidName(name);
    if (strippedName === name)
      return;

    const requiredPercentage = settings.miscellaneous.validNamePercentage;

    // If the percentage of correct name >= required percentage.
    const newName = Math.round((strippedName.length / name.length) * 100) >= requiredPercentage
      ? strippedName
      : messages.miscellaneous.renameList[Math.floor(Math.random() * messages.miscellaneous.renameList.length)];

    try {
      await member.setNickname(newName);
    } catch (unknownError: unknown) {
      Logger.error('Could not rename a member with an invalid name.');
      Logger.detail(`Member's name: "${name}"`);
      Logger.detail(`Stripped name: "${strippedName}"`);
      Logger.detail(`New name: "${newName}"`);
      Logger.detail(`Change nicknames permission: ${member.guild.me.hasPermission(Permissions.FLAGS.MANAGE_NICKNAMES)}`);
      Logger.error((unknownError as Error).stack);
    }

    await member.send(messages.miscellaneous.renamed).catch(noop);
  }
}

export default GuildMemberAddListener;

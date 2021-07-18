import { Event } from '@sapphire/framework';
import { Permissions } from 'discord.js';
import type { GuildMember, TextChannel } from 'discord.js';
import pupa from 'pupa';
import ModerationHelper from '@/app/moderation/ModerationHelper';
import { noop, toValidName } from '@/app/utils';
import messages from '@/conf/messages';
import settings from '@/conf/settings';

export default class GuildMemberAddEvent extends Event {
  public override async run(member: GuildMember): Promise<void> {
    await this._greet(member);
    await this._remute(member);
    await this._rename(member);
  }

  private async _greet(member: GuildMember): Promise<void> {
    const { greetings } = messages.miscellaneous;
    const randomMessage = greetings[Math.floor(Math.random() * greetings.length)];

    const channel = this.context.client.cache.channels.main as TextChannel;

    const content = pupa(randomMessage, { member });
    await channel.send(content).catch(noop);
  }

  private async _remute(member: GuildMember): Promise<void> {
    const isMuted = await ModerationHelper.isMuted(member.id);
    if (isMuted) {
      try {
        const muteRole = member.guild.roles.resolve(settings.roles.mute);
        if (muteRole)
          await member.roles.add(muteRole);
      } catch (unknownError: unknown) {
        this.context.logger.error('Could not add the mute role to a member.');
        this.context.logger.info(`MuteObject: "${JSON.stringify(isMuted)}"`);
        this.context.logger.info(`Manager roles permission: ${member.guild.me?.hasPermission(Permissions.FLAGS.MANAGE_ROLES)}`);
        this.context.logger.error((unknownError as Error).stack);
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
      this.context.logger.error('Could not rename a member with an invalid name.');
      this.context.logger.info(`Member's name: "${name}"`);
      this.context.logger.info(`Stripped name: "${strippedName}"`);
      this.context.logger.info(`New name: "${newName}"`);
      this.context.logger.info(`Change nicknames permission: ${member.guild.me?.hasPermission(Permissions.FLAGS.MANAGE_NICKNAMES)}`);
      this.context.logger.error((unknownError as Error).stack);
    }

    await member.send(messages.miscellaneous.renamed).catch(noop);
  }
}

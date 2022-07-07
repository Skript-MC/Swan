import { ApplyOptions } from '@sapphire/decorators';
import type { GuildMember } from 'discord.js';
import { Permissions } from 'discord.js';
import type { TaskOptions } from '@/app/structures/tasks/Task';
import GuildMemberTask from '@/app/structures/tasks/listeners/GuildMemberTask';
import { noop, toValidName } from '@/app/utils';
import messages from '@/conf/messages';
import settings from '@/conf/settings';
import { normalizeMemberUsername as config } from '@/conf/tasks/listeners/guildMemberAdd';

@ApplyOptions<TaskOptions>(config.settings)
export default class NormalizeMemberUsernameTask extends GuildMemberTask {
  public async runListener(member: GuildMember): Promise<void> {
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
      this.container.logger.error('Could not rename a member with an invalid name.');
      this.container.logger.info(`Member's name: "${name}"`);
      this.container.logger.info(`Stripped name: "${strippedName}"`);
      this.container.logger.info(`New name: "${newName}"`);
      this.container.logger.info(`Change nicknames permission: ${member.guild.me?.permissions.has(Permissions.FLAGS.MANAGE_NICKNAMES)}`);
      this.container.logger.error((unknownError as Error).stack);
    }

    await member.send(messages.miscellaneous.renamed).catch(noop);
  }
}

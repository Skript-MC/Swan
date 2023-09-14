import { execSync } from 'node:child_process';
import { ApplyOptions } from '@sapphire/decorators';
import type { ChatInputCommand } from '@sapphire/framework';
import type { ApplicationCommandOptionData } from 'discord.js';
import { ApplicationCommandType, EmbedBuilder } from 'discord.js';
import moment from 'moment';
import pupa from 'pupa';
import { statistics as config } from '#config/commands/basic';
import { bot, colors } from '#config/settings';
import { SwanCommand } from '#structures/commands/SwanCommand';

@ApplyOptions<SwanCommand.Options>(config.settings)
export class StatisticsCommand extends SwanCommand {
  commandType = ApplicationCommandType.ChatInput;
  commandOptions: ApplicationCommandOptionData[] = [];

  public override async chatInputRun(
    interaction: SwanCommand.ChatInputInteraction,
    _context: ChatInputCommand.RunContext,
  ): Promise<void> {
    await this._exec(interaction);
  }

  private async _exec(interaction: SwanCommand.ChatInputInteraction): Promise<void> {
    const totalCommands = this.container.stores.get('commands').size;
    const embedMessages = config.messages.embed;
    const commitHash = this._getGitRev();
    const commitTag = this._getGitTag();
    const embed = new EmbedBuilder()
      .setColor(colors.default)
      .setAuthor({ name: config.messages.embed.title, iconURL: bot.avatar })
      .addFields(
        {
          name: embedMessages.version,
          value: pupa(embedMessages.versionContent, {
            version: commitTag,
            commitLink: `[${commitHash.slice(0, 7)}](https://github.com/Skript-MC/Swan/commit/${commitHash})`,
          }),
          inline: true,
        },
        { name: embedMessages.memory, value: `${(process.memoryUsage().rss / 1024 / 1024).toFixed(2)} MB`, inline: true },
        { name: embedMessages.uptime, value: moment.duration(this.container.client.uptime).humanize(), inline: true },
        { name: embedMessages.commands, value: totalCommands.toString(), inline: true },
        { name: embedMessages.developers, value: embedMessages.developersContent, inline: true },
        { name: embedMessages.thanks, value: embedMessages.thanksContent, inline: true },
        {
          name: embedMessages.bugs,
          value: pupa(embedMessages.bugsContent, { url: 'https://github.com/Skript-MC/Swan/issues/new' }),
          inline: true,
        },
      )
      .setTimestamp();

    await interaction.reply({ embeds: [embed] });
  }

  private _getGitRev(): string {
    if (this.container.client.cache.gitCommit)
      return this.container.client.cache.gitCommit;

    const rev = execSync('git rev-parse HEAD').toString().trim();
    this.container.client.cache.gitCommit = rev;
    return rev;
  }

  private _getGitTag(): string {
    if (this.container.client.cache.gitTag)
      return this.container.client.cache.gitTag;

    const tag = execSync('git describe --tags --abbrev=0').toString().trim();
    this.container.client.cache.gitTag = tag;
    return tag;
  }
}

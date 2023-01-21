import { execSync } from 'node:child_process';
import type { ChatInputCommand } from '@sapphire/framework';
import { EmbedBuilder } from 'discord.js';
import moment from 'moment';
import pupa from 'pupa';
import ApplySwanOptions from '@/app/decorators/swanOptions';
import { SwanCommand } from '@/app/structures/commands/SwanCommand';
import { statistics as config } from '@/conf/commands/basic';
import messages from '@/conf/messages';
import settings from '@/conf/settings';
import pkg from '@/root/package.json';

@ApplySwanOptions(config)
export default class StatisticsCommand extends SwanCommand {
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
    const embed = new EmbedBuilder()
      .setColor(settings.colors.default)
      .setAuthor({ name: config.messages.embed.title, iconURL: settings.bot.avatar })
      .setDescription(pupa(config.messages.embed.description, { prefix: settings.bot.prefix }))
      .addFields(
        {
          name: embedMessages.version,
          value: pupa(embedMessages.versionContent, {
            version: pkg.version,
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
          value: pupa(embedMessages.bugsContent, { url: pkg.bugs?.url || pkg.homepage }),
          inline: true,
        },
      )
      .setFooter({ text: pupa(messages.global.executedBy, { member: interaction.member }) })
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
}

import { execSync } from 'node:child_process';
import type { ChatInputCommand } from '@sapphire/framework';
import type { CommandInteraction } from 'discord.js';
import { MessageEmbed } from 'discord.js';
import moment from 'moment';
import pupa from 'pupa';
import ApplySwanOptions from '@/app/decorators/swanOptions';
import SwanCommand from '@/app/structures/commands/SwanCommand';
import { statistics as config } from '@/conf/commands/basic';
import messages from '@/conf/messages';
import settings from '@/conf/settings';
import pkg from '@/root/package.json';

@ApplySwanOptions(config)
export default class StatisticsCommand extends SwanCommand {

  public override async chatInputRun(
    interaction: CommandInteraction,
    _context: ChatInputCommand.RunContext,
  ): Promise<void> {
    await this._exec(interaction);
  }

  private async _exec(interaction: CommandInteraction): Promise<void> {
    const totalCommands = this.container.stores.get('commands').size;
    const embedMessages = config.messages.embed;
    const commitHash = this._getGitRev();
    const embed = new MessageEmbed()
      .setColor(settings.colors.default)
      .setAuthor({ name: config.messages.embed.title, iconURL: settings.bot.avatar })
      .setDescription(pupa(config.messages.embed.description, { prefix: settings.bot.prefix }))
      .addField(
        embedMessages.version,
        pupa(embedMessages.versionContent, {
          version: pkg.version,
          commitLink: `[${commitHash.slice(0, 7)}](https://github.com/Skript-MC/Swan/commit/${commitHash})`,
        }),
        true,
      )
      .addField(embedMessages.memory, `${(process.memoryUsage().rss / 1024 / 1024).toFixed(2)} MB`, true)
      .addField(embedMessages.uptime, moment.duration(this.container.client.uptime).humanize(), true)
      .addField(embedMessages.commands, totalCommands.toString(), true)
      .addField(embedMessages.developers, embedMessages.developersContent, true)
      .addField(embedMessages.thanks, embedMessages.thanksContent, true)
      .addField(embedMessages.bugs, pupa(embedMessages.bugsContent, { url: pkg.bugs?.url || pkg.homepage }), true)
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

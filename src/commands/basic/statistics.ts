import { promises as fs } from 'node:fs';
import path from 'node:path';
import { ApplyOptions } from '@sapphire/decorators';
import { MessageEmbed } from 'discord.js';
import moment from 'moment';
import pupa from 'pupa';
import SwanCommand from '@/app/structures/commands/SwanCommand';
import type { GuildMessage, SwanCommandOptions } from '@/app/types';
import type { StatisticsCommandArguments } from '@/app/types/CommandArguments';
import { statistics as config } from '@/conf/commands/basic';
import messages from '@/conf/messages';
import settings from '@/conf/settings';
import pkg from '@/root/package.json';

@ApplyOptions<SwanCommandOptions>({ ...settings.globalCommandsOptions, ...config.settings })
export default class StatisticsCommand extends SwanCommand {
  public override async messageRun(message: GuildMessage, _args: StatisticsCommandArguments): Promise<void> {
    const totalCommands = this.container.stores.get('commands').size;
    const embedMessages = config.messages.embed;
    const commitHash = await this._getGitRev();
    const embed = new MessageEmbed()
      .setColor(settings.colors.default)
      .setAuthor(config.messages.embed.title, settings.bot.avatar)
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
      .setFooter(pupa(messages.global.executedBy, { member: message.member }))
      .setTimestamp();

    await message.channel.send({ embeds: [embed] });
  }

  private async _getGitRev(): Promise<string> {
    if (this.container.client.cache.gitCommit)
      return this.container.client.cache.gitCommit;

    let rev = (await fs.readFile(path.join(process.cwd(), '.git', 'HEAD'))).toString();
    if (!rev.includes(':')) {
      this.container.client.cache.gitCommit = rev;
      return rev;
    }

    rev = (await fs.readFile(path.join(process.cwd(), '.git', rev.slice(5).trim()))).toString();
    this.container.client.cache.gitCommit = rev;
    return rev;
  }
}

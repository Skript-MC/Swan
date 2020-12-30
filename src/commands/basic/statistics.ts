import { Command } from 'discord-akairo';
import { MessageEmbed } from 'discord.js';
import moment from 'moment';
import pupa from 'pupa';
import { statistics as config } from '../../../config/commands/basic';
import settings from '../../../config/settings';
import pkg from '../../../package.json';
import { Rules } from '../../types';
import type { GuildMessage } from '../../types';
import type { StatisticsCommandArguments } from '../../types/CommandArguments';

class StatisticsCommand extends Command {
  constructor() {
    super('statistics', {
      aliases: config.settings.aliases,
      details: config.details,
      clientPermissions: config.settings.clientPermissions,
      userPermissions: config.settings.userPermissions,
      channel: 'guild',
    });
    this.rules = [Rules.OnlyBotChannel];
  }

  public async exec(message: GuildMessage, _args: StatisticsCommandArguments): Promise<void> {
    const totalCommands = this.handler.categories.array().flatMap(cat => cat.array()).length;
    const embedMessages = config.messages.embed;
    const embed = new MessageEmbed()
      .setColor(settings.colors.default)
      .attachFiles([settings.bot.avatar])
      .setAuthor(config.messages.embed.title, 'attachment://logo.png')
      .setDescription(
        pupa(config.messages.embed.description, {
          prefix: settings.bot.prefix,
          helpCommand: `${settings.bot.prefix}help`,
        }),
      )
      .addField(embedMessages.version, pkg.version, true)
      .addField(embedMessages.memory, `${(process.memoryUsage().rss / 1024 / 1024).toFixed(2)} MB`, true)
      .addField(embedMessages.uptime, moment.duration(this.client.uptime).humanize(), true)
      .addField(embedMessages.commands, totalCommands.toString(), true)
      .addField(embedMessages.developers, embedMessages.developersContent, true)
      .addField(embedMessages.thanks, embedMessages.thanksContent, true)
      .addField(embedMessages.bugs, pupa(embedMessages.bugsContent, { url: pkg.bugs?.url || pkg.homepage }), true)
      .setFooter(`Exécuté par ${message.author.username}`)
      .setTimestamp();

    await message.util.send(embed);
  }
}

export default StatisticsCommand;

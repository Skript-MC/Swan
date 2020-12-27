import { Command } from 'discord-akairo';
import { MessageEmbed } from 'discord.js';
import moment from 'moment';
import { statistics as config } from '../../../config/commands/basic';
import settings from '../../../config/settings';
import pkg from '../../../package.json';
import type { StatisticsCommandArguments } from '../../types/CommandArguments';
import Rules from '../../types/rules';
import type { GuildMessage } from '../../types/utils';

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
    const embed = new MessageEmbed()
      .setColor(settings.colors.default)
      .attachFiles([settings.bot.avatar])
      .setAuthor(config.messages.embed.title, 'attachment://logo.png')
      .setDescription(config.messages.embed.description.replace('{PREFIX}', settings.bot.prefix).replace('{HELP}', `${settings.bot.prefix}help`))
      .addField(config.messages.embed.version, pkg.version, true)
      .addField(config.messages.embed.memory, `${(process.memoryUsage().rss / 1024 / 1024).toFixed(2)} MB`, true)
      .addField(config.messages.embed.uptime, moment.duration(this.client.uptime).humanize(), true)
      .addField(config.messages.embed.commands, totalCommands.toString(), true)
      .addField(config.messages.embed.developers, config.messages.embed.developersContent, true)
      .addField(config.messages.embed.thanks, config.messages.embed.thanksContent, true)
      .addField(config.messages.embed.bugs, config.messages.embed.bugsContent.replace('{URL}', pkg.bugs?.url || pkg.homepage), true)
      .setFooter(`Exécuté par ${message.author.username}`)
      .setTimestamp();

    await message.util.send(embed);
  }
}

export default StatisticsCommand;

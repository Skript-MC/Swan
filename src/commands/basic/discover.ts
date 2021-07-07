import { Command } from 'discord-akairo';
import { MessageEmbed } from 'discord.js';
import pupa from 'pupa';
import { Rules } from '@/app/types';
import type { GuildMessage } from '@/app/types';
import type { DiscoverCommandArguments } from '@/app/types/CommandArguments';
import { discover as config } from '@/conf/commands/basic';
import messages from '@/conf/messages';
import settings from '@/conf/settings';

class DiscoverCommand extends Command {
  constructor() {
    super('discover', {
      aliases: config.settings.aliases,
      details: config.details,
      clientPermissions: config.settings.clientPermissions,
      userPermissions: config.settings.userPermissions,
      channel: 'guild',
    });
    this.rules = Rules.OnlyBotChannel;
  }

  public async exec(message: GuildMessage, _args: DiscoverCommandArguments): Promise<void> {
    const { prefix, categories } = this.handler;

    const commands = categories
      .array()
      .flatMap(category => category.array());
    const randomCommand = commands[Math.floor(Math.random() * commands.length)];

    const embed = new MessageEmbed()
      .setColor(settings.colors.default);

    embed.setTitle(pupa(config.messages.title, { randomCommand }))
      .addField(config.messages.usage, `\`${prefix}${randomCommand.details.usage}\``)
      .addField(config.messages.description, randomCommand.details.content)
      .addField(config.messages.usableBy, randomCommand.details?.permissions ?? messages.global.everyone);

    if (randomCommand.aliases.length > 1)
      embed.addField(config.messages.aliases, `\`${randomCommand.aliases.join(`\`${messages.miscellaneous.separator}\``)}\``);
    if (randomCommand.details?.examples?.length)
      embed.addField(config.messages.examples, `\`${prefix}${randomCommand.details.examples.join(`\`${messages.miscellaneous.separator}\`${prefix}`)}\``);

    await message.channel.send(embed);
  }
}

export default DiscoverCommand;

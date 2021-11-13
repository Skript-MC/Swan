import { ApplyOptions } from '@sapphire/decorators';
import { MessageEmbed } from 'discord.js';
import pupa from 'pupa';
import SwanCommand from '@/app/structures/commands/SwanCommand';
import type { GuildMessage, SwanCommandOptions } from '@/app/types';
import type { DiscoverCommandArguments } from '@/app/types/CommandArguments';
import { discover as config } from '@/conf/commands/basic';
import messages from '@/conf/messages';
import settings from '@/conf/settings';

@ApplyOptions<SwanCommandOptions>({ ...settings.globalCommandsOptions, ...config.settings })
export default class DiscoverCommand extends SwanCommand {
  public override async messageRun(message: GuildMessage, _args: DiscoverCommandArguments): Promise<void> {
    const randomCommand = this.container.stores.get('commands').random() as SwanCommand;

    const embed = new MessageEmbed()
      .setColor(settings.colors.default)
      .setTitle(pupa(config.messages.title, randomCommand))
      .addField(config.messages.usage, `\`${settings.bot.prefix}${randomCommand.usage}\``)
      .addField(config.messages.description, randomCommand.description)
      .addField(config.messages.usableBy, randomCommand.permissions.length > 0 ? randomCommand.permissions.join(', ') : messages.global.everyone);

    if (randomCommand.aliases.length > 1)
      embed.addField(config.messages.aliases, `\`${randomCommand.aliases.join(`\`${messages.miscellaneous.separator}\``)}\``);
    if (randomCommand.examples.length > 0)
      embed.addField(config.messages.examples, `\`${settings.bot.prefix}${randomCommand.examples.join(`\`${messages.miscellaneous.separator}\`${settings.bot.prefix}`)}\``);

    await message.channel.send({ embeds: [embed] });
  }
}

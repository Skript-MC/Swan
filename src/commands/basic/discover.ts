import { ApplyOptions } from '@sapphire/decorators';
import type { Args } from '@sapphire/framework';
import { MessageEmbed } from 'discord.js';
import pupa from 'pupa';
import SwanCommand from '@/app/structures/commands/SwanCommand';
import type SwanCommandStore from '@/app/structures/commands/SwanCommandStore';
import type { GuildMessage, SwanCommandOptions } from '@/app/types';
import { discover as config } from '@/conf/commands/basic';
import messages from '@/conf/messages';
import settings from '@/conf/settings';

@ApplyOptions<SwanCommandOptions>({ ...settings.globalCommandsOptions, ...config.settings })
export default class DiscoverCommand extends SwanCommand {
  public override async run(message: GuildMessage, _args: Args): Promise<void> {
    const { prefix } = settings.bot;

    const commands = (this.context.stores.get('commands') as SwanCommandStore).array();
    const randomCommand = commands[Math.floor(Math.random() * commands.length)];

    const embed = new MessageEmbed()
      .setColor(settings.colors.default);

    embed.setTitle(pupa(config.messages.title, { randomCommand }))
      .addField(config.messages.usage, `\`${prefix}${randomCommand.usage}\``)
      .addField(config.messages.description, randomCommand.description)
      .addField(config.messages.usableBy, randomCommand?.permission ?? messages.global.everyone);

    if (randomCommand.aliases.length > 1)
      embed.addField(config.messages.aliases, `\`${randomCommand.aliases.join(`\`${messages.miscellaneous.separator}\``)}\``);
    if (randomCommand?.examples?.length)
      embed.addField(config.messages.examples, `\`${prefix}${randomCommand.examples.join(`\`${messages.miscellaneous.separator}\`${prefix}`)}\``);

    await message.channel.send(embed);
  }
}

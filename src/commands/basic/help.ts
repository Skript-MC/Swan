import { ApplyOptions } from '@sapphire/decorators';
import { isDMChannel } from '@sapphire/discord.js-utilities';
import { ok } from '@sapphire/framework';
import type { Message } from 'discord.js';
import { MessageEmbed } from 'discord.js';
import groupBy from 'lodash.groupby';
import pupa from 'pupa';
import Arguments from '@/app/decorators/Argument';
import SwanCommand from '@/app/structures/commands/SwanCommand';
import { GuildMessage } from '@/app/types';
import type { SwanCommandOptions } from '@/app/types';
import { HelpCommandArguments } from '@/app/types/CommandArguments';
import { capitalize, inlineCodeList } from '@/app/utils';
import { help as config } from '@/conf/commands/basic';
import messages from '@/conf/messages';
import settings from '@/conf/settings';

@ApplyOptions<SwanCommandOptions>({ ...settings.globalCommandsOptions, ...config.settings })
export default class HelpCommand extends SwanCommand {
  @Arguments({
    name: 'command',
    type: 'command',
    match: 'pick',
  })
  // @ts-expect-error ts(2416)
  public override async messageRun(message: GuildMessage, args: HelpCommandArguments): Promise<void> {
    const embed = new MessageEmbed().setColor(settings.colors.default);

    const { command } = args;
    if (command) {
      const information = config.messages.commandInfo;
      embed.setTitle(pupa(information.title, { name: capitalize(command.name) }))
        .setDescription(pupa(command.description, { prefix: settings.bot.prefix }))
        .addField(information.usage, `\`${settings.bot.prefix}${command.usage}\``)
        .addField(information.usableBy, command.permissions.length > 0
          ? command.permissions.join(', ')
          : messages.global.everyone);

      if (command.aliases.length > 1)
        embed.addField(information.aliases, inlineCodeList(command.aliases));
      if (command.examples.length > 0)
        embed.addField(information.examples, inlineCodeList(command.examples, '\n'));
    } else {
      const information = config.messages.commandsList;
      const amount = this.container.stores.get('commands').size;

      embed.setTitle(pupa(information.title, { amount }))
        .setDescription(pupa(information.description, { helpCommand: `${settings.bot.prefix}help <commande>` }));

      const categories = await this._getPossibleCategories(message);

      for (const [category, commands] of Object.entries(categories)) {
        embed.addField(
          pupa(information.category, { categoryName: capitalize(category) }),
          inlineCodeList(commands.map(cmd => cmd.aliases[0])),
        );
      }
    }

    await message.channel.send({ embeds: [embed] });
  }

  private async _getPossibleCategories(message: Message): Promise<Record<string, SwanCommand[]>> {
    const originalCommands = this.container.stores.get('commands');
    const commands: SwanCommand[] = [];

    for (const command of originalCommands.values()) {
      const result = isDMChannel(message.channel) ? ok() : await command.preconditions.run(message, command);
      if (result.success)
        commands.push(command as SwanCommand);
    }

    return groupBy(commands, command => command.location.directories.shift());
  }
}

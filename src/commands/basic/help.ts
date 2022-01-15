import { isDMChannel } from '@sapphire/discord.js-utilities';
import type { ChatInputCommand } from '@sapphire/framework';
import { ok } from '@sapphire/framework';
import type { ApplicationCommandOptionData, AutocompleteInteraction, CommandInteraction } from 'discord.js';
import { MessageEmbed } from 'discord.js';
import { ApplicationCommandOptionTypes } from 'discord.js/typings/enums';
import groupBy from 'lodash.groupby';
import pupa from 'pupa';
import ApplySwanOptions from '@/app/decorators/swanOptions';
import resolveCommand from '@/app/resolvers/command';
import SwanCommand from '@/app/structures/commands/SwanCommand';
import { capitalize, inlineCodeList, searchClosestCommand } from '@/app/utils';
import { help as config } from '@/conf/commands/basic';
import messages from '@/conf/messages';
import settings from '@/conf/settings';

@ApplySwanOptions(config)
export default class HelpCommand extends SwanCommand {
  public static commandOptions: ApplicationCommandOptionData[] = [
    {
      type: ApplicationCommandOptionTypes.STRING,
      name: 'commande',
      description: 'Commande dont vous cherchez des informations',
      required: false,
      autocomplete: true,
    },
  ];

  public override async autocompleteRun(interaction: AutocompleteInteraction): Promise<void> {
    const commands = [...this.container.stores.get('commands').values()];
    const search = searchClosestCommand(commands as SwanCommand[], interaction.options.getString('commande'));
    await interaction.respond(
      search
        .slice(0, 20)
        .map(entry => ({
          name: entry.matchedName,
          value: entry.baseName,
        })),
    );
  }

  public override async chatInputRun(
    interaction: CommandInteraction,
    _context: ChatInputCommand.RunContext,
  ): Promise<void> {
    const command = resolveCommand(interaction.options.getString('commande'));

    await this._exec(interaction, command.value);
  }

  private async _exec(interaction: CommandInteraction, command: SwanCommand | null): Promise<void> {
    const embed = new MessageEmbed().setColor(settings.colors.default);

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

      const categories = await this._getPossibleCategories(interaction);

      for (const [category, commands] of Object.entries(categories)) {
        embed.addField(
          pupa(information.category, { categoryName: capitalize(category) }),
          inlineCodeList(commands.map(cmd => cmd.aliases[0])),
        );
      }
    }

    await interaction.reply({ embeds: [embed] });
  }

  private async _getPossibleCategories(interaction: CommandInteraction): Promise<Record<string, SwanCommand[]>> {
    const originalCommands = [...this.container.stores.get('commands').values()];
    const commands: SwanCommand[] = [];

    for (const command of originalCommands as SwanCommand[]) {
      const result = isDMChannel(interaction.channel)
        ? ok()
        : await command.preconditions.chatInputRun(interaction, command as ChatInputCommand);
      if (result.success)
        commands.push(command);
    }

    return groupBy(commands, command => command.location.directories.shift());
  }
}

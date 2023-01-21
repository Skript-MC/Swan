import type { ChatInputCommand } from '@sapphire/framework';
import { ok } from '@sapphire/framework';
import type {
  ApplicationCommandOptionData,
  AutocompleteInteraction,
  BaseApplicationCommandOptionsData,
} from 'discord.js';
import { ApplicationCommandOptionType, EmbedBuilder } from 'discord.js';
import groupBy from 'lodash.groupby';
import pupa from 'pupa';
import ApplySwanOptions from '@/app/decorators/swanOptions';
import resolveCommand from '@/app/resolvers/command';
import { SwanCommand } from '@/app/structures/commands/SwanCommand';
import { capitalize, inlineCodeList, searchClosestCommand } from '@/app/utils';
import { help as config } from '@/conf/commands/basic';
import messages from '@/conf/messages';
import settings from '@/conf/settings';

@ApplySwanOptions(config)
export default class HelpCommand extends SwanCommand {
  public static commandOptions: ApplicationCommandOptionData[] = [
    {
      type: ApplicationCommandOptionType.String,
      name: 'commande',
      description: 'Commande dont vous cherchez des informations',
      required: false,
      autocomplete: true,
    },
  ];

  public override async autocompleteRun(interaction: AutocompleteInteraction): Promise<void> {
    const commands = [...this.container.stores.get('commands').values()];
    const search = searchClosestCommand(commands as SwanCommand[], interaction, interaction.options.getString('commande'));
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
    interaction: SwanCommand.ChatInputInteraction,
    _context: ChatInputCommand.RunContext,
  ): Promise<void> {
    const command = resolveCommand(interaction.options.getString('commande'));

    await this._exec(interaction, command.unwrapOr(null as SwanCommand));
  }

  private async _exec(interaction: SwanCommand.ChatInputInteraction, command: SwanCommand | null): Promise<void> {
    const embed = new EmbedBuilder().setColor(settings.colors.default);

    if (command) {
      const information = config.messages.commandInfo;
      embed.setTitle(pupa(information.title, { name: capitalize(command.name) }))
        .setDescription(pupa(command.description, { prefix: settings.bot.prefix }))
        .addFields(
          { name: information.usage, value: `\`${settings.bot.prefix}${this._buildCommandUsage(command)}\`` },
          {
            name: information.usableBy,
            value: command.permissions.length > 0 ? command.permissions.join(', ') : messages.global.everyone,
          },
        );

      if (command.examples.length > 0)
        embed.addFields({ name: information.examples, value: inlineCodeList(command.examples, '\n') });
    } else {
      const information = config.messages.commandsList;
      const amount = this.container.stores.get('commands').size;

      embed.setTitle(pupa(information.title, { amount }))
        .setDescription(pupa(information.description, { helpCommand: `${settings.bot.prefix}help <commande>` }));

      const categories = await this._getPossibleCategories(interaction);

      for (const [category, commands] of Object.entries(categories)) {
        embed.addFields({
          name: pupa(information.category, { categoryName: capitalize(category) }),
          value: inlineCodeList(commands.filter(cmd => cmd.command).map(cmd => cmd.command)),
        });
      }
    }

    await interaction.reply({ embeds: [embed] });
  }

  private async _getPossibleCategories(
    interaction: SwanCommand.ChatInputInteraction,
  ): Promise<Record<string, SwanCommand[]>> {
    const originalCommands = [...this.container.stores.get('commands').values()];
    const commands: SwanCommand[] = [];

    for (const command of originalCommands as SwanCommand[]) {
      const result = interaction.channel.isDMBased()
        ? ok()
        : await command.preconditions.chatInputRun(interaction, command as ChatInputCommand);
      if (result.isOk())
        commands.push(command);
    }

    return groupBy(commands, command => command.location.directories.shift());
  }

  private _buildCommandUsage(command: SwanCommand): string {
    let usage = command.command;
    for (const option of command.commandOptions)
      usage += (option as BaseApplicationCommandOptionsData).required ? ` <${option.name}>` : ` [${option.name}]`;
    return usage;
  }
}

import { ApplyOptions } from '@sapphire/decorators';
import type { ChatInputCommand } from '@sapphire/framework';
import type { ApplicationCommandOptionData } from 'discord.js';
import { ApplicationCommandOptionType, ApplicationCommandType } from 'discord.js';
import { rule as config } from '#config/commands/basic';
import { Message } from '#models/message';
import { SwanCommand } from '#structures/commands/SwanCommand';
import { MessageName } from '#types/index';
import { searchClosestMessage } from '#utils/index';

@ApplyOptions<SwanCommand.Options>(config.settings)
export class RuleCommand extends SwanCommand {
  override canRunInDM = true;
  commandType = ApplicationCommandType.ChatInput;
  commandOptions: ApplicationCommandOptionData[] = [
    {
      type: ApplicationCommandOptionType.String,
      name: 'règle',
      description: 'Règle pré-enregistrée à envoyer',
      required: true,
      autocomplete: true,
    },
  ];

  public override async chatInputRun(
    interaction: SwanCommand.ChatInputInteraction,
    _context: ChatInputCommand.RunContext,
  ): Promise<void> {
    await this._exec(interaction, interaction.options.getString('règle', true));
  }

  public override async autocompleteRun(interaction: SwanCommand.AutocompleteInteraction): Promise<void> {
    const messages = await Message.find({ messageType: MessageName.Rule });
    const search = searchClosestMessage(messages, interaction.options.getString('règle', true));
    await interaction.respond(
      search.slice(0, 20).map((entry) => ({
        name: entry.matchedName,
        value: entry.baseName,
      })),
    );
  }

  private async _exec(interaction: SwanCommand.ChatInputInteraction, messageName: string): Promise<void> {
    const message = await Message.findOne({
      messageType: MessageName.Rule,
      name: messageName,
    });
    if (!message) {
      await interaction.reply(config.messages.notFound);
      return;
    }
    await interaction.reply(message.content);
  }
}

import type { ChatInputCommand } from '@sapphire/framework';
import type { ApplicationCommandOptionData } from 'discord.js';
import { ApplicationCommandOptionType, ApplicationCommandType } from 'discord.js';
import { ApplySwanOptions } from '@/app/decorators/swanOptions';
import { Message } from '@/app/models/message';
import { SwanCommand } from '@/app/structures/commands/SwanCommand';
import { MessageName } from '@/app/types';
import { searchClosestMessage } from '@/app/utils';
import { autoMessage as config } from '@/conf/commands/basic';

@ApplySwanOptions(config)
export class AutoMessageCommand extends SwanCommand {
  commandType = ApplicationCommandType.ChatInput;
  commandOptions: ApplicationCommandOptionData[] = [
    {
      type: ApplicationCommandOptionType.String,
      name: 'message',
      description: 'Message pré-enregistré à envoyer',
      required: true,
      autocomplete: true,
    },
  ];

  public override async chatInputRun(
    interaction: SwanCommand.ChatInputInteraction,
    _context: ChatInputCommand.RunContext,
  ): Promise<void> {
    await this._exec(interaction, interaction.options.getString('message', true));
  }

  public override async autocompleteRun(interaction: SwanCommand.AutocompleteInteraction): Promise<void> {
    const messages = await Message.find({ messageType: MessageName.AutoMessage });
    const search = searchClosestMessage(messages, interaction.options.getString('message', true));
    await interaction.respond(
      search
        .slice(0, 20)
        .map(entry => ({
          name: entry.matchedName,
          value: entry.baseName,
        })),
    );
  }

  private async _exec(interaction: SwanCommand.ChatInputInteraction, messageName: string): Promise<void> {
    const message = await Message.findOne({ messageType: MessageName.AutoMessage, name: messageName });
    if (!message) {
      await interaction.reply(config.messages.notFound);
      return;
    }
    await interaction.reply(message.content);
  }
}

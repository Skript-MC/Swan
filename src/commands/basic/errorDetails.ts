import type { ChatInputCommand } from '@sapphire/framework';
import type { ApplicationCommandOptionData } from 'discord.js';
import { ApplicationCommandOptionType, ApplicationCommandType } from 'discord.js';
import { ApplySwanOptions } from '@/app/decorators/swanOptions';
import { Message } from '@/app/models/message';
import { SwanCommand } from '@/app/structures/commands/SwanCommand';
import { MessageName } from '@/app/types';
import { searchMessageSimilarity } from '@/app/utils';
import { errorDetails as config } from '@/conf/commands/basic';

@ApplySwanOptions(config)
export class ErrorDetailsCommand extends SwanCommand {
  commandType = ApplicationCommandType.ChatInput;
  commandOptions: ApplicationCommandOptionData[] = [
    {
      type: ApplicationCommandOptionType.String,
      name: 'erreur',
      description: "Erreur dont vous souhaitez avoir plus d'informations",
      required: true,
    },
  ];

  public override async chatInputRun(
    interaction: SwanCommand.ChatInputInteraction,
    _context: ChatInputCommand.RunContext,
  ): Promise<void> {
    await this._exec(interaction, interaction.options.getString('erreur', true));
  }

  private async _exec(interaction: SwanCommand.ChatInputInteraction, error: string): Promise<void> {
    const errors = await Message.find({ messageType: MessageName.ErrorDetail });
    const search = searchMessageSimilarity(errors, error);
    if (!search) {
      await interaction.reply(config.messages.notFound);
      return;
    }
    await interaction.reply(search.content);
  }
}

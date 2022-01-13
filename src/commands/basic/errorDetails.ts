import type { ChatInputCommand } from '@sapphire/framework';
import type { ApplicationCommandOptionData, CommandInteraction } from 'discord.js';
import { ApplicationCommandOptionTypes } from 'discord.js/typings/enums';
import ApplySwanOptions from '@/app/decorators/swanOptions';
import Message from '@/app/models/message';
import SwanCommand from '@/app/structures/commands/SwanCommand';
import { MessageName } from '@/app/types';
import { errorDetails as config } from '@/conf/commands/basic';
import { searchMessageSimilarity } from '@/app/utils';

@ApplySwanOptions(config)
export default class ErrorDetailsCommand extends SwanCommand {
  public static commandOptions: ApplicationCommandOptionData[] = [
    {
      type: ApplicationCommandOptionTypes.STRING,
      name: 'erreur',
      description: "Erreur dont vous souhaitez avoir plus d'informations",
      required: true,
    },
  ];

  public override async chatInputRun(
    interaction: CommandInteraction,
    _context: ChatInputCommand.RunContext,
  ): Promise<void> {
    await this._exec(interaction, interaction.options.getString('erreur'));
  }

  private async _exec(interaction: CommandInteraction, error: string): Promise<void> {
    const errors = await Message.find({ messageType: MessageName.ErrorDetail });
    const search = searchMessageSimilarity(errors, error);
    if (!search) {
      await interaction.reply(config.messages.notFound);
      return;
    }
    await interaction.reply(search.content);
  }
}

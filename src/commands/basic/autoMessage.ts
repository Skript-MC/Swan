import type { ChatInputCommand } from '@sapphire/framework';
import type { ApplicationCommandOptionData, AutocompleteInteraction, CommandInteraction } from 'discord.js';
import { ApplicationCommandOptionTypes } from 'discord.js/typings/enums';
import ApplySwanOptions from '@/app/decorators/swanOptions';
import Message from '@/app/models/message';
import SwanCommand from '@/app/structures/commands/SwanCommand';
import { MessageName } from '@/app/types';
import { searchClosestEntry } from '@/app/utils';
import { autoMessage as config } from '@/conf/commands/basic';

@ApplySwanOptions(config)
export default class AutoMessageCommand extends SwanCommand {
  public static commandOptions: ApplicationCommandOptionData[] = [
    {
      type: ApplicationCommandOptionTypes.STRING,
      name: 'message',
      description: 'Message pré-enregistré à envoyer',
      required: true,
      autocomplete: true,
    },
  ];

  public override async chatInputRun(
    interaction: CommandInteraction,
    _context: ChatInputCommand.RunContext,
  ): Promise<void> {
    await this._exec(interaction, interaction.options.getString('message'));
  }

  public override async autocompleteRun(interaction: AutocompleteInteraction): Promise<void> {
    const messages = await Message.find({ messageType: MessageName.AutoMessage });
    const search = searchClosestEntry(messages, interaction.options.getString('message'));
    await interaction.respond(
      search
        .slice(0, 20)
        .map(entry => ({
          name: entry.matchedName,
          value: entry.baseName,
        })),
    );
  }

  private async _exec(interaction: CommandInteraction, messageName: string): Promise<void> {
    const message = await Message.findOne({ messageType: MessageName.AutoMessage, name: messageName });
    if (!message) {
      await interaction.reply(config.messages.notFound);
      return;
    }
    await interaction.reply(message.content);
  }
}

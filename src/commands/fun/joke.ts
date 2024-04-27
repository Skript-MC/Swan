import { ApplyOptions } from '@sapphire/decorators';
import type { ChatInputCommand } from '@sapphire/framework';
import type { ApplicationCommandOptionData } from 'discord.js';
import {
  ApplicationCommandOptionType,
  ApplicationCommandType,
  EmbedBuilder,
} from 'discord.js';
import { joke as config } from '#config/commands/fun';
import { colors } from '#config/settings';
import { Message } from '#models/message';
import { SwanCommand } from '#structures/commands/SwanCommand';
import type { MessageDocument } from '#types/index';
import { MessageName } from '#types/index';
import { searchClosestMessage } from '#utils/index';

@ApplyOptions<SwanCommand.Options>(config.settings)
export class JokeCommand extends SwanCommand {
  override canRunInDM = true;
  commandType = ApplicationCommandType.ChatInput;
  commandOptions: ApplicationCommandOptionData[] = [
    {
      type: ApplicationCommandOptionType.String,
      name: 'blague',
      description: 'Blague que vous souhaitez envoyer',
      required: false,
      autocomplete: true,
    },
  ];

  public override async chatInputRun(
    interaction: SwanCommand.ChatInputInteraction,
    _context: ChatInputCommand.RunContext,
  ): Promise<void> {
    await this._exec(interaction, interaction.options.getString('blague'));
  }

  public override async autocompleteRun(
    interaction: SwanCommand.AutocompleteInteraction,
  ): Promise<void> {
    const jokes = await Message.find({ messageType: MessageName.Joke });
    // If we are running the autocomplete command, we can assume that the user has already typed something in "blague"
    const search = searchClosestMessage(
      jokes,
      interaction.options.getString('blague', true),
    );
    await interaction.respond(
      search.slice(0, 20).map((entry) => ({
        name: entry.matchedName,
        value: entry.baseName,
      })),
    );
  }

  private async _exec(
    interaction: SwanCommand.ChatInputInteraction,
    jokeName: string | null,
  ): Promise<void> {
    // TODO(interactions): Add a "rerun" button. Increment the command's usage count.
    let joke: MessageDocument | null = null;
    if (jokeName) {
      joke = await Message.findOne({
        name: jokeName,
        messageType: MessageName.Joke,
      });
    } else {
      const jokeCount = await Message.countDocuments({
        messageType: MessageName.Joke,
      });
      const random = Math.floor(Math.random() * jokeCount);
      joke = await Message.findOne({ messageType: MessageName.Joke }).skip(
        random,
      );
    }

    if (!joke?.content) {
      await interaction.reply(config.messages.notFound);
      return;
    }

    const embed = new EmbedBuilder()
      .setDescription(joke.content)
      .setColor(colors.default)
      .setTimestamp();

    await interaction.reply({ embeds: [embed] });
  }
}

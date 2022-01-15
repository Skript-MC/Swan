import type { ChatInputCommand } from '@sapphire/framework';
import type {
 ApplicationCommandOptionData, CommandInteraction, MessageReaction, User,
} from 'discord.js';
import { Message } from 'discord.js';
import type { ApplicationCommandTypes } from 'discord.js/typings/enums';
import { ApplicationCommandOptionTypes } from 'discord.js/typings/enums';
import ApplySwanOptions from '@/app/decorators/swanOptions';
import SwanCommand from '@/app/structures/commands/SwanCommand';
import { noop } from '@/app/utils';
import { latex as config } from '@/conf/commands/fun';
import messages from '@/conf/messages';
import settings from '@/conf/settings';

@ApplySwanOptions(config)
export default class LatexCommand extends SwanCommand {
  public static commandType: ApplicationCommandTypes.CHAT_INPUT;
  public static commandOptions: ApplicationCommandOptionData[] = [
    {
      type: ApplicationCommandOptionTypes.STRING,
      name: 'équation',
      description: 'Équation à mettre en forme en utilisant LaTeX',
      required: true,
    },
  ];

  public override async chatInputRun(
    interaction: CommandInteraction,
    _context: ChatInputCommand.RunContext,
  ): Promise<void> {
    await this._exec(interaction, interaction.options.getString('équation'));
  }

  private async _exec(interaction: CommandInteraction, equation: string): Promise<void> {
    const sendMessage = await interaction.reply({
      content: settings.apis.latex + encodeURIComponent(equation),
      fetchReply: true,
    });
    if (!(sendMessage instanceof Message))
      return;
    await sendMessage.react(settings.emojis.remove).catch(noop);
    const collector = sendMessage
      .createReactionCollector({
        filter: (reaction: MessageReaction, user: User) => user.id === interaction.member.user.id
          && !user.bot
          && (reaction.emoji.id ?? reaction.emoji.name) === settings.emojis.remove,
      }).on('collect', async () => {
        try {
          collector.stop();
          await sendMessage.delete();
        } catch {
          await interaction.reply(messages.global.oops).catch(noop);
        }
      });
  }
}

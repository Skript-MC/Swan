import { ApplyOptions } from '@sapphire/decorators';
import type { ChatInputCommand } from '@sapphire/framework';
import type { ApplicationCommandOptionData, MessageReaction, User } from 'discord.js';
import { ApplicationCommandOptionType, ApplicationCommandType, Message } from 'discord.js';
import { SwanCommand } from '@/app/structures/commands/SwanCommand';
import { noop } from '@/app/utils';
import { latex as config } from '@/conf/commands/fun';
import * as messages from '@/conf/messages';
import { apis, emojis } from '@/conf/settings';

@ApplyOptions<SwanCommand.Options>(config.settings)
export class LatexCommand extends SwanCommand {
  commandType = ApplicationCommandType.ChatInput;
  commandOptions: ApplicationCommandOptionData[] = [
    {
      type: ApplicationCommandOptionType.String,
      name: 'équation',
      description: 'Équation à mettre en forme en utilisant LaTeX',
      required: true,
    },
  ];

  public override async chatInputRun(
    interaction: SwanCommand.ChatInputInteraction,
    _context: ChatInputCommand.RunContext,
  ): Promise<void> {
    await this._exec(interaction, interaction.options.getString('équation', true));
  }

  private async _exec(interaction: SwanCommand.ChatInputInteraction, equation: string): Promise<void> {
    const sendMessage = await interaction.reply({
      content: apis.latex + encodeURIComponent(equation),
      fetchReply: true,
    });
    if (!(sendMessage instanceof Message))
      return;
    await sendMessage.react(emojis.remove).catch(noop);
    const collector = sendMessage
      .createReactionCollector({
        filter: (reaction: MessageReaction, user: User) => user.id === interaction.member.user.id
          && !user.bot
          && (reaction.emoji.id ?? reaction.emoji.name) === emojis.remove,
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

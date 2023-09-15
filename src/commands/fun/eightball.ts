import { ApplyOptions } from '@sapphire/decorators';
import type { ChatInputCommand } from '@sapphire/framework';
import type { ApplicationCommandOptionData } from 'discord.js';
import { ApplicationCommandOptionType, ApplicationCommandType, EmbedBuilder } from 'discord.js';
import { eightBall as config } from '#config/commands/fun';
import { colors } from '#config/settings';
import { SwanCommand } from '#structures/commands/SwanCommand';

@ApplyOptions<SwanCommand.Options>(config.settings)
export class EightBallCommand extends SwanCommand {
  override canRunInDM = true;
  commandType = ApplicationCommandType.ChatInput;
  commandOptions: ApplicationCommandOptionData[] = [
    {
      type: ApplicationCommandOptionType.String,
      name: 'question',
      description: 'Question que vous souhaitez poser à Swan.',
      required: true,
    },
  ];

  public override async chatInputRun(
    interaction: SwanCommand.ChatInputInteraction,
    _context: ChatInputCommand.RunContext,
  ): Promise<void> {
    await this._exec(interaction);
  }

  private async _exec(interaction: SwanCommand.ChatInputInteraction): Promise<void> {
    const isAffirmative = Math.random() > 0.5;
    const pool = config.messages[isAffirmative ? 'affirmative' : 'negative'];
    const answer = pool[Math.floor(Math.random() * pool.length)];
    const embed = new EmbedBuilder()
      .setColor(colors.default)
      .setTimestamp()
      .setTitle(interaction.options.getString('question', true))
      .setDescription(answer);
    await interaction.reply({ embeds: [embed] });
  }
}

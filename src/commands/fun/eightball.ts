import type { ChatInputCommand } from '@sapphire/framework';
import type { ApplicationCommandOptionData, CommandInteraction } from 'discord.js';
import { MessageEmbed } from 'discord.js';
import { ApplicationCommandOptionTypes } from 'discord.js/typings/enums';
import pupa from 'pupa';
import ApplySwanOptions from '@/app/decorators/swanOptions';
import SwanCommand from '@/app/structures/commands/SwanCommand';
import { eightBall as config } from '@/conf/commands/fun';
import settings from '@/conf/settings';

@ApplySwanOptions(config)
export default class EightBallCommand extends SwanCommand {
  public static commandOptions: ApplicationCommandOptionData[] = [
    {
      type: ApplicationCommandOptionTypes.STRING,
      name: 'question',
      description: 'Question que vous souhaitez poser à Swan.',
      required: true,
    },
  ];

  public override async chatInputRun(
    interaction: CommandInteraction,
    _context: ChatInputCommand.RunContext,
  ): Promise<void> {
    await this._exec(interaction);
  }

  private async _exec(interaction: CommandInteraction): Promise<void> {
    const isAffirmative = Math.random() > 0.5;
    const pool = config.messages[isAffirmative ? 'affirmative' : 'negative'];
    const answer = pool[Math.floor(Math.random() * pool.length)];
    const embed = new MessageEmbed()
      .setColor(settings.colors.default)
      .setTimestamp()
      .setTitle(interaction.options.getString('question'))
      .setDescription(answer)
      .setFooter({ text: pupa(config.messages.footer, { member: interaction.member }) });
    await interaction.reply({ embeds: [embed] });
  }
}

import type { ChatInputCommand } from '@sapphire/framework';
import type { ApplicationCommandOptionData } from 'discord.js';
import { ApplicationCommandType, EmbedBuilder } from 'discord.js';
import pupa from 'pupa';
import { ApplySwanOptions } from '@/app/decorators/swanOptions';
import { SwanCommand } from '@/app/structures/commands/SwanCommand';
import { idea as config } from '@/conf/commands/fun';
import * as messages from '@/conf/messages';
import { colors } from '@/conf/settings';

@ApplySwanOptions(config)
export class IdeaCommand extends SwanCommand {
  commandType = ApplicationCommandType.ChatInput;
  commandOptions: ApplicationCommandOptionData[] = [];

  public override async chatInputRun(
    interaction: SwanCommand.ChatInputInteraction,
    _context: ChatInputCommand.RunContext,
  ): Promise<void> {
    await this._exec(interaction);
  }

  private async _exec(interaction: SwanCommand.ChatInputInteraction): Promise<void> {
    // TODO(interactions): Add a "rerun" button. Increment the command's usage count.
    const channel = this.container.client.cache.channels.idea;

    const ideas = await channel.messages.fetch().catch(console.error);
    if (!ideas) {
      await interaction.reply(config.messages.noIdeaFound);
      return;
    }

    const randomIdea = ideas.random(1)[0];
    if (!randomIdea) {
      await interaction.reply(config.messages.noIdeaFound);
      return;
    }

    const embed = new EmbedBuilder()
      .setColor(colors.default)
      .setAuthor({
        name: pupa(config.messages.ideaTitle, { name: randomIdea.member?.displayName ?? messages.global.unknownName }),
        iconURL: randomIdea.author.avatarURL(),
      })
      .setDescription(randomIdea.content)
      .setFooter({ text: pupa(messages.global.executedBy, { member: interaction.member }) })
      .setTimestamp(randomIdea.createdAt);

    await interaction.reply({ embeds: [embed] });
  }
}

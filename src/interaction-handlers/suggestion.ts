import { ApplyOptions } from '@sapphire/decorators';
import type { InteractionHandlerOptions, Option } from '@sapphire/framework';
import {
  InteractionHandler,
  InteractionHandlerTypes,
} from '@sapphire/framework';
import type { ButtonInteraction } from 'discord.js';
import {
  ActionRowBuilder,
  ButtonBuilder,
  ButtonStyle,
  EmbedBuilder,
} from 'discord.js';
import * as messages from '#config/messages';
import { bot, colors } from '#config/settings';
import * as SuggestionManager from '#structures/SuggestionManager';

@ApplyOptions<InteractionHandlerOptions>({
  interactionHandlerType: InteractionHandlerTypes.Button,
})
export class SuggestionHandler extends InteractionHandler {
  public override parse(interaction: ButtonInteraction): Option<never> {
    if (!interaction.customId.startsWith('suggestion')) return this.none();
    return this.some();
  }

  public async run(interaction: ButtonInteraction): Promise<void> {
    const response = await SuggestionManager.suggestionVote(
      interaction.message.id,
      interaction.customId === 'suggestion_upvote',
      interaction.user.id,
    );

    let embed: EmbedBuilder;
    const actions = [];
    switch (response?.status) {
      case 'OK':
        embed = new EmbedBuilder()
          .setColor(colors.default)
          .setTitle(messages.suggestions.registeredVote.title)
          .setDescription(messages.suggestions.registeredVote.content)
          .setFooter({ text: messages.suggestions.brand, iconURL: bot.avatar });
        break;
      case 'UNLINKED':
        actions.push(
          new ActionRowBuilder<ButtonBuilder>().addComponents(
            new ButtonBuilder()
              .setLabel(messages.suggestions.loginButton)
              .setURL('https://skript-mc.fr/account/discord/')
              .setStyle(ButtonStyle.Link),
          ),
        );
        embed = new EmbedBuilder()
          .setColor(colors.error)
          .setTitle(messages.suggestions.unlinked.title)
          .setDescription(messages.suggestions.unlinked.content)
          .setFooter({ text: messages.suggestions.brand, iconURL: bot.avatar });
        break;
      case 'ALREADY_VOTED':
        embed = new EmbedBuilder()
          .setColor(colors.error)
          .setTitle(messages.suggestions.alreadyVoted.title)
          .setDescription(messages.suggestions.alreadyVoted.content)
          .setFooter({ text: messages.suggestions.brand, iconURL: bot.avatar });
        break;
      case 'NO_SELFVOTE':
        embed = new EmbedBuilder()
          .setColor(colors.error)
          .setTitle(messages.suggestions.selfVote.title)
          .setDescription(messages.suggestions.selfVote.content)
          .setFooter({ text: messages.suggestions.brand, iconURL: bot.avatar });
        break;
      default:
        embed = new EmbedBuilder()
          .setColor(colors.error)
          .setTitle(messages.suggestions.error.title)
          .setDescription(messages.suggestions.error.content)
          .setFooter({ text: messages.suggestions.brand, iconURL: bot.avatar });
    }
    if (response?.suggestion) {
      const message = await interaction.channel?.messages.fetch(
        interaction.message.id,
      );
      // Get the new embed and actions for this suggestion
      const suggestionEmbed = await SuggestionManager.getSuggestionEmbed(
        response.suggestion,
      );
      const suggestionActions = SuggestionManager.getSuggestionActions(
        response.suggestion,
      );
      await message?.edit({
        embeds: [suggestionEmbed],
        components: [suggestionActions],
      });
    }

    await interaction.reply({
      embeds: [embed],
      components: actions,
      ephemeral: true,
    });
  }
}

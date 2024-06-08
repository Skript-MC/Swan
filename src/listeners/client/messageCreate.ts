import { MessageLimits, MessageLinkRegex as rawMessageLinkRegex } from '@sapphire/discord-utilities';
import { Listener } from '@sapphire/framework';
import type { Message } from 'discord.js';
import {
  ActionRowBuilder,
  ButtonBuilder,
  ButtonStyle,
  ChannelType,
  EmbedBuilder,
  MessageFlags,
  PermissionFlagsBits,
} from 'discord.js';
import * as messages from '#config/messages';
import { bot, channels, colors, emojis, roles } from '#config/settings';
import * as SuggestionManager from '#structures/SuggestionManager';
import type { GuildMessage } from '#types/index';
import { nullop, trimText } from '#utils/index';

const MessageLinkRegex = new RegExp(rawMessageLinkRegex.source.slice(1, -1), 'gimu');
interface MessageLinkMatch {
  guildId: string;
  channelId: string;
  messageId: string;
}

export class MessageCreateListener extends Listener {
  public override async run(message: Message): Promise<void> {
    if (
      !message.inGuild() ||
      (message.guild.members.me && message.content.startsWith(message.guild.members.me.toString())) ||
      message.author.bot ||
      message.system
    )
      return;

    await this._addReactionsInIdeaChannel(message);
    await this._handleSuggestion(message);
    await this._quoteLinkedMessage(message);
    await this._antispamSnippetsChannel(message);
  }

  private async _addReactionsInIdeaChannel(message: GuildMessage): Promise<void> {
    // Add reactions in the Idea channel.
    if (message.channel.id === channels.idea) {
      try {
        await message.react(emojis.yes);
        await message.react(emojis.no);
      } catch (unknownError: unknown) {
        this.container.logger.error('Unable to add emojis to the idea channel.');
        this.container.logger.info(
          `Has "ADD_REACTION" permission: ${message.guild.members.me
            ?.permissionsIn(message.channel)
            .has(PermissionFlagsBits.AddReactions)}`,
        );
        this.container.logger.info(`Emojis added: "${emojis.yes}" + "${emojis.no}"`);
        this.container.logger.info(
          `Idea channel ID/Current channel ID: ${channels.idea}/${
            message.channel.id
          } (same=${channels.idea === message.channel.id})`,
        );
        this.container.logger.info(`Message: ${message.url}`);
        this.container.logger.error((unknownError as Error).stack);
      }
    }
  }

  private async _handleSuggestion(message: GuildMessage): Promise<void> {
    // Send embed and add reactions in the Suggestion channel.
    if (message.channel.id === channels.suggestions) {
      await message.delete();

      const response = await SuggestionManager.publishSuggestion(message.content, message.author.id);
      if (response?.status === 'PUBLISHED' && response.suggestion) {
        const suggestionEmbed = await SuggestionManager.getSuggestionEmbed(response.suggestion);
        const suggestionActions = SuggestionManager.getSuggestionActions(response.suggestion);
        const suggestionMessage = await message.channel.send({
          embeds: [suggestionEmbed],
          components: [suggestionActions],
        });

        const thread = await suggestionMessage.startThread({
          name: `Suggestion ${response.suggestion.id} de ${response.suggestion.user.username}`,
        });

        if (response.suggestion.user.discordId) await thread.members.add(response.suggestion.user.discordId);

        await SuggestionManager.suggestionCallback(response.suggestion, suggestionMessage);

        const embed = new EmbedBuilder()
          .setColor(colors.success)
          .setTitle(messages.suggestions.published.title)
          .setDescription(messages.suggestions.published.content)
          .setFooter({ text: messages.suggestions.brand, iconURL: bot.avatar });
        await message.author.send({ embeds: [embed] });
      } else if (response?.status === 'UNLINKED') {
        const embed = new EmbedBuilder()
          .setColor(colors.error)
          .setTitle(messages.suggestions.unlinked.title)
          .setDescription(messages.suggestions.unlinked.content)
          .setFooter({ text: messages.suggestions.brand, iconURL: bot.avatar });

        const actions = new ActionRowBuilder<ButtonBuilder>().addComponents(
          new ButtonBuilder()
            .setLabel(messages.suggestions.loginButton)
            .setURL(response.loginUrl ?? 'https://skript-mc.fr/suggestions/')
            .setStyle(ButtonStyle.Link),
        );
        await message.author.send({ embeds: [embed], components: [actions] });
      } else {
        const embed = new EmbedBuilder()
          .setColor(colors.error)
          .setTitle(messages.suggestions.error.title)
          .setDescription(messages.suggestions.error.content)
          .setFooter({ text: messages.suggestions.brand, iconURL: bot.avatar });
        await message.author.send({ embeds: [embed] });
      }
    }
  }

  private async _quoteLinkedMessage(message: GuildMessage): Promise<void> {
    // Quote a linked message.
    const found = message.content.matchAll(MessageLinkRegex);
    // TODO: Unique by messageId.
    const quotes = [...found]
      .map((match) => match.groups as unknown as MessageLinkMatch)
      .filter((match) => match.guildId === message.guild.id);

    for (const quote of quotes) {
      const channel = await this.container.client.channels.fetch(quote.channelId).catch(nullop);
      if (channel?.type !== ChannelType.GuildText) continue;

      const targetedMessage = await channel.messages.fetch(quote.messageId);
      if (!targetedMessage?.content) continue;

      const embed = new EmbedBuilder()
        .setColor(colors.default)
        .setAuthor({
          name: `Message de ${targetedMessage.member?.displayName ?? targetedMessage.author.username}`,
          iconURL: targetedMessage.author.displayAvatarURL(),
        })
        .setDescription(
          `${trimText(targetedMessage.content, MessageLimits.MaximumLength - 100)}\n[(lien)](${targetedMessage.url})`,
        );

      // We add all attachments if needed.
      if (targetedMessage.attachments.size > 0) {
        const attachments = [...targetedMessage.attachments.values()].slice(0, 5);
        for (const [i, attachment] of attachments.entries())
          embed.addFields({
            name: `Pièce jointe n°${i + 1}`,
            value: attachment.url,
          });
      }

      const msg = await message.reply({
        embeds: [embed],
        flags: MessageFlags.SuppressNotifications,
      });
      const collector = msg
        .createReactionCollector({
          filter: (reaction, user) =>
            user.id === message.author.id && (reaction.emoji.id || reaction.emoji.name) === emojis.remove && !user.bot,
        })
        .on('collect', async () => {
          await msg.delete();
          collector.stop();
        });

      await msg.react(emojis.remove);
    }
  }

  private async _antispamSnippetsChannel(message: GuildMessage): Promise<void> {
    // We prevent people from spamming unnecessarily the Snippets channel.
    if (message.channel.id === channels.snippets && !message.member?.roles.cache.has(roles.staff)) {
      // We check that they are not the author of the last message in case they exceed the 2.000 chars limit
      // and they want to add details or informations.
      try {
        const previousAuthorId = await message.channel.messages
          // eslint-disable-next-line no-undefined
          .fetch({
            before: message.channel.lastMessageId ?? undefined,
            limit: 1,
          })
          .then((elt) => elt.first()?.author.id);
        if (previousAuthorId !== message.author.id && !/```(?:.|\n)*```/gmu.test(message.content)) {
          await message.delete();
          await message.member?.send(messages.miscellaneous.noSpam);
          await message.member?.send(message.content);
        }
      } catch {
        /* Ignored */
      }
    }
  }
}

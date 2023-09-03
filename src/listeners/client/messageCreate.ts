import { MessageLimits } from '@sapphire/discord-utilities';
import { Listener } from '@sapphire/framework';
import type { Message } from 'discord.js';
import {
  ActionRowBuilder,
  ButtonBuilder,
  ButtonStyle,
  ChannelType,
  DMChannel,
  EmbedBuilder,
  PermissionsBitField,
} from 'discord.js';
import * as SuggestionManager from '@/app/structures/SuggestionManager';
import type { GuildMessage } from '@/app/types';
import { noop, nullop, trimText } from '@/app/utils';
import * as messages from '@/conf/messages';
import {
  bot,
  channels,
  colors,
  emojis,
  roles,
} from '@/conf/settings';

export class MessageCreateListener extends Listener {
  public override async run(message: Message): Promise<void> {
    if (message.content.startsWith(bot.prefix)
      || message.content.startsWith(message.guild?.members.me.toString())
      || message.author.bot
      || message.system
      || message.channel instanceof DMChannel)
      return;

    // Run all needed tasks, and stop when there is either no more tasks or one returned true (= wants to stop).
    let task: { done?: boolean; value: boolean } = { done: false, value: false };
    const tasks = this._getTasks(message as GuildMessage);

    while (!task.done && !task.value)
      task = await tasks.next();
  }

  private async * _getTasks(message: GuildMessage): AsyncGenerator<boolean, boolean> {
    yield await this._addReactionsInIdeaChannel(message);
    yield await this._handleSuggestion(message);
    yield await this._quoteLinkedMessage(message);
    yield await this._antispamSnippetsChannel(message);
    return false;
  }

  private async _addReactionsInIdeaChannel(message: GuildMessage): Promise<boolean> {
    // Add reactions in the Idea channel.
    if (message.channel.id === channels.idea) {
      try {
        await message.react(emojis.yes);
        await message.react(emojis.no);
      } catch (unknownError: unknown) {
        this.container.logger.error('Unable to add emojis to the idea channel.');
        this.container.logger.info(`Has "ADD_REACTION" permission: ${message.guild.members.me?.permissionsIn(message.channel).has(PermissionsBitField.Flags.AddReactions)}`);
        this.container.logger.info(`Emojis added: "${emojis.yes}" + "${emojis.no}"`);
        this.container.logger.info(`Idea channel ID/Current channel ID: ${channels.idea}/${message.channel.id} (same=${channels.idea === message.channel.id})`);
        this.container.logger.info(`Message: ${message.url}`);
        this.container.logger.error((unknownError as Error).stack);
      }
    }
    return false;
  }

  private async _handleSuggestion(message: GuildMessage): Promise<boolean> {
    // Send embed and add reactions in the Suggestion channel.
    if (message.channel.id === channels.suggestions) {
      await message.delete();
      const response = await SuggestionManager.publishSuggestion(message.content, message.author.id);
      if (response?.status === 'PUBLISHED') {
        const suggestionEmbed = await SuggestionManager.getSuggestionEmbed(response.suggestion);
        const suggestionActions = SuggestionManager.getSuggestionActions(response.suggestion);
        const suggestionMessage = await message.channel.send({
          embeds: [suggestionEmbed],
          components: [suggestionActions],
        });
        const thread = await suggestionMessage.startThread({
          name: `Suggestion ${response.suggestion.id} de ${response.suggestion.user.username}`,
        });
        if (response.suggestion.user.discordId)
          await thread.members.add(response.suggestion.user.discordId);
        await SuggestionManager.suggestionCallback(response.suggestion, suggestionMessage);
        const embed = new EmbedBuilder()
          .setColor(colors.success)
          .setTitle(messages.suggestions.published.title)
          .setDescription(messages.suggestions.published.content)
          .setFooter({ text: messages.suggestions.brand, iconURL: bot.avatar });
        await message.author.send({ embeds: [embed] });
        return false;
      } else if (response?.status === 'UNLINKED') {
        const embed = new EmbedBuilder()
          .setColor(colors.error)
          .setTitle(messages.suggestions.unlinked.title)
          .setDescription(messages.suggestions.unlinked.content)
          .setFooter({ text: messages.suggestions.brand, iconURL: bot.avatar });
        const actions = new ActionRowBuilder<ButtonBuilder>()
          .addComponents(
            new ButtonBuilder()
              .setLabel(messages.suggestions.loginButton)
              .setURL(response.loginUrl)
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
    return false;
  }

  private async _quoteLinkedMessage(message: GuildMessage): Promise<boolean> {
    // Disable quotes for commands
    if (message.content.startsWith(bot.prefix))
      return false;

    // Quote a linked message.
    const linkRegex = new RegExp(`https://(?:ptb.|canary.)?discord(?:app)?.com/channels/${message.guild.id}/(\\d{18})/(\\d{18})`, 'imu');
    if (!linkRegex.test(message.content))
      return false;

    const quotes: Array<{ channelId: string; messageId: string }> = [];
    let text = message.content;
    while (linkRegex.test(text)) {
      const [full, channelId, messageId] = linkRegex.exec(text)!;
      quotes.push({ channelId, messageId });
      text = text.replace(full, '');
    }

    for (const quote of quotes) {
      const channel = await this.container.client.channels.fetch(quote.channelId).catch(nullop);
      if (channel?.type !== ChannelType.GuildText)
        continue;

      const targetedMessage = await channel.messages.fetch(quote.messageId);
      if (!targetedMessage?.content)
        continue;

      const embed = new EmbedBuilder()
        .setColor(colors.default)
        .setAuthor({
          name: `Message de ${targetedMessage.member?.displayName ?? targetedMessage.author.username}`,
          iconURL: targetedMessage.author.avatarURL(),
        })
        .setDescription(`${trimText(targetedMessage.content, MessageLimits.MaximumLength - 100)}\n[(lien)](${targetedMessage.url})`)
        .setFooter({ text: `Message cité par ${message.member.displayName}.` });

      // We add all attachments if needed.
      if (targetedMessage.attachments.size > 0) {
        const attachments = [...targetedMessage.attachments.values()].slice(0, 5);
        for (const [i, attachment] of attachments.entries())
          embed.addFields({ name: `Pièce jointe n°${i}`, value: attachment.url });
      }

      const msg = await message.channel.send({ embeds: [embed] });
      const collector = msg
        .createReactionCollector({
          filter: (reaction, user) => user.id === message.author.id
            && (reaction.emoji.id || reaction.emoji.name) === emojis.remove
            && !user.bot,
        }).on('collect', async () => {
          await msg.delete().catch(noop);
          collector.stop();
        });

      await msg.react(emojis.remove);
    }
    return false;
  }

  private async _antispamSnippetsChannel(message: GuildMessage): Promise<boolean> {
    // We prevent people from spamming unnecessarily the Snippets channel.
    if (message.channel.id === channels.snippets
      && !message.member.roles.cache.has(roles.staff)) {
      // We check that they are not the author of the last message in case they exceed the 2.000 chars limit
      // and they want to add details or informations.
      try {
        const previousAuthorId = await message.channel.messages
          .fetch({ before: message.channel.lastMessageId, limit: 1 })
          .then(elt => elt.first()?.author.id);
        if (previousAuthorId !== message.author.id && !/```(?:.|\n)*```/gmu.test(message.content)) {
          await message.delete();
          await message.member.send(messages.miscellaneous.noSpam);
          await message.member.send(message.content);
        }
      } catch { /* Ignored */ }
    }
    return false;
  }
}

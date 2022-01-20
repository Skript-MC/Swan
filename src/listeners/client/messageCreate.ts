import { MessageLimits } from '@sapphire/discord-utilities';
import { Listener } from '@sapphire/framework';
import type { Message } from 'discord.js';
import {
  DMChannel,
  MessageActionRow,
  MessageButton,
  MessageEmbed,
  Permissions,
} from 'discord.js';
import pupa from 'pupa';
import type SwanClient from '@/app/SwanClient';
import Sanction from '@/app/models/sanction';
import SuggestionManager from '@/app/structures/SuggestionManager';
import type { GuildMessage } from '@/app/types';
import { SanctionTypes } from '@/app/types';
import { noop, nullop, trimText } from '@/app/utils';
import messages from '@/conf/messages';
import settings from '@/conf/settings';

export default class MessageCreateListener extends Listener {
  public override async run(message: Message): Promise<void> {
    if (message.content.startsWith(settings.bot.prefix)
      || message.content.startsWith(message.guild?.me.toString())
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
    yield await this._updateMemberIfBanned(message);
    yield await this._preventActiveMembersToPostDocLinks(message);
    yield await this._addReactionsInIdeaChannel(message);
    yield await this._handleSuggestion(message);
    yield await this._quoteLinkedMessage(message);
    yield await this._antispamSnippetsChannel(message);
    yield await this._checkCreationsChannelRules(message);
    return false;
  }

  private async _updateMemberIfBanned(message: GuildMessage): Promise<boolean> {
    if (this.container.client.cache.channelBannedSilentUsers.has(message.author.id)) {
      const sanction = await Sanction.findOne({
        memberId: message.author.id,
        type: SanctionTypes.Ban,
        revoked: false,
      }).catch(nullop);
      if (!sanction || sanction.informations?.banChannelId !== message.channel.id)
        return false;

      await Sanction.updateOne({ _id: sanction._id }, { $set: { informations: { hasSentMessages: true } } });
      this.container.client.cache.channelBannedSilentUsers.delete(message.author.id);
    }
    return false;
  }

  private async _preventActiveMembersToPostDocLinks(message: GuildMessage): Promise<boolean> {
    // Prevent member with the "Active member" role to post the link of a "banned" documentation.
    if (message.member.roles.cache.has(settings.roles.activeMember)
      && (settings.miscellaneous.activeMemberBlacklistedLinks.some(link => message.content.includes(link)))) {
      await message.delete();
      const content = (message.content.length + messages.miscellaneous.noDocLink.length) >= MessageLimits.MaximumLength
        ? trimText(message.content, MessageLimits.MaximumLength - messages.miscellaneous.noDocLink.length - 3)
        : message.content;
      await message.author.send(pupa(messages.miscellaneous.noDocLink, { content }));

      return true;
    }
    return false;
  }

  private async _addReactionsInIdeaChannel(message: GuildMessage): Promise<boolean> {
    // Add reactions in the Idea channel.
    if (message.channel.id === settings.channels.idea) {
      try {
        await message.react(settings.emojis.yes);
        await message.react(settings.emojis.no);
      } catch (unknownError: unknown) {
        this.container.logger.error('Unable to add emojis to the idea channel.');
        this.container.logger.info(`Has "ADD_REACTION" permission: ${message.guild.me?.permissionsIn(message.channel).has(Permissions.FLAGS.ADD_REACTIONS)}`);
        this.container.logger.info(`Emojis added: "${settings.emojis.yes}" + "${settings.emojis.no}"`);
        this.container.logger.info(`Idea channel ID/Current channel ID: ${settings.channels.idea}/${message.channel.id} (same=${settings.channels.idea === message.channel.id})`);
        this.container.logger.info(`Message: ${message.url}`);
        this.container.logger.error((unknownError as Error).stack);
      }
    }
    return false;
  }

  private async _handleSuggestion(message: GuildMessage): Promise<boolean> {
    // Send embed and add reactions in the Suggestion channel.
    if (message.channel.id === settings.channels.suggestions) {
      await message.delete();
      const response = await SuggestionManager.publishSuggestion(message.content, message.author.id);
      if (response.status === 'PUBLISHED') {
        const { client } = this.container;
        const suggestionEmbed = await SuggestionManager.getSuggestionEmbed(client as SwanClient, response.suggestion);
        const suggestionActions = SuggestionManager.getSuggestionActions(client as SwanClient, response.suggestion);
        const suggestionMessage = await message.channel.send({
          embeds: [suggestionEmbed],
          components: [suggestionActions],
        });
        await SuggestionManager.suggestionCallback(response.suggestion, suggestionMessage);
        const embed = new MessageEmbed()
          .setColor(settings.colors.success)
          .setTitle('Suggestion publiée')
          .setDescription("Merci pour votre suggestion ! Elle a été publiée sur toutes les plateformes de Skript-MC et la communauté va voter votre suggestion. Elle sera prochainement traitée avec la communauté et l'équipe, et peut-être appliquée (qui sait 👀).")
          .setFooter({ text: 'Suggestions Skript-MC', iconURL: settings.bot.avatar });
        await message.author.send({ embeds: [embed] });
        return false;
      }
      const embed = new MessageEmbed()
        .setColor(settings.colors.error)
        .setTitle('🔗 Liaison requise')
        .setDescription("Oups, un problème est survenu lors de la publication de votre suggestion : il semblerait que votre compte Discord ne corresponde à aucun compte Skript-MC. Pour pouvoir bénéficier des intégrations sur notre serveur Discord, il est nécessaire de lier votre compte Discord à votre compte Skript-MC.\n\nNos lutins vous ont préparé un lien magique : il ne vous suffit plus qu'à vous connecter à votre compte Skript-MC, et vous bénéficierez des intégrations sur notre serveur Discord.")
        .setFooter({ text: 'Suggestions Skript-MC', iconURL: settings.bot.avatar });
      const actions = new MessageActionRow()
        .addComponents(
          new MessageButton()
            .setLabel('Connexion à Skript-MC')
            .setURL(response.loginUrl)
            .setStyle('LINK'),
        );
      await message.author.send({ embeds: [embed], components: [actions] });
    }
    return false;
  }

  private async _quoteLinkedMessage(message: GuildMessage): Promise<boolean> {
    // Disable quotes for commands
    if (message.content.startsWith(settings.bot.prefix))
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
      if (!channel?.isText() || channel.type === 'DM')
        continue;

      const targetedMessage = await channel.messages.fetch(quote.messageId);
      if (!targetedMessage?.content)
        continue;

      const embed = new MessageEmbed()
        .setColor(settings.colors.default)
        .setAuthor({
          name: `Message de ${targetedMessage.member?.displayName ?? targetedMessage.author.username}`,
          iconURL: targetedMessage.author.avatarURL() ?? '',
        })
        .setDescription(`${trimText(targetedMessage.content, MessageLimits.MaximumLength - 100)}\n[(lien)](${targetedMessage.url})`)
        .setFooter({ text: `Message cité par ${message.member.displayName}.` });

      // We add all attachments if needed.
      if (targetedMessage.attachments.size > 0) {
        const attachments = [...targetedMessage.attachments.values()].slice(0, 5);
        for (const [i, attachment] of attachments.entries())
          embed.addField(`Pièce jointe n°${i}`, attachment.url);
      }

      const msg = await message.channel.send({ embeds: [embed] });
      const collector = msg
        .createReactionCollector({
          filter: (reaction, user) => user.id === message.author.id
            && (reaction.emoji.id || reaction.emoji.name) === settings.emojis.remove
            && !user.bot,
        }).on('collect', async () => {
          await msg.delete().catch(noop);
          collector.stop();
        });

      await msg.react(settings.emojis.remove);
    }
    return false;
  }

  private async _antispamSnippetsChannel(message: GuildMessage): Promise<boolean> {
    // We prevent people from spamming unnecessarily the Snippets channel.
    if (message.channel.id === settings.channels.snippets
      && !message.member.roles.cache.has(settings.roles.staff)) {
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

  private async _checkCreationsChannelRules(message: GuildMessage): Promise<boolean> {
    // We oblige people to post a skript-mc's link of their resource in the Creation channel.
    if (message.channel.id === settings.channels.creations
        && !message.member.roles.cache.has(settings.roles.staff)
        && message.content
          .match(/(?:https?:\/\/\S+)/g)
          ?.some(link => !/(?:https?:\/\/skript-mc\.fr\S+)/g.test(link))
    ) {
      await message.delete();
      await message.member.send(pupa(messages.miscellaneous.invalidMessage, { message }));
      await message.member.send(message.content);
    }
    return false;
  }
}

import axios from 'axios';
import { Listener } from 'discord-akairo';
import { DMChannel, MessageEmbed, Permissions } from 'discord.js';
import type { Message } from 'discord.js';
import pupa from 'pupa';
import Logger from '@/app/structures/Logger';
import type { GuildMessage } from '@/app/types';
import { noop, nullop, trimText } from '@/app/utils';
import messages from '@/conf/messages';
import settings from '@/conf/settings';

class MessageListener extends Listener {
  constructor() {
    super('message', {
      event: 'message',
      emitter: 'client',
    });
  }

  public async exec(message: Message): Promise<void> {
    const isCommand = Boolean(this.client.commandHandler.parseWithPrefix(message, '=').command);
    if (isCommand || message.author.bot || message.system || message.channel instanceof DMChannel)
      return;

    // Run all needed tasks, and stop when there is either no more tasks or one returned true (= wants to stop).
    let task: { done?: boolean; value: boolean } = { done: false, value: false };
    const tasks = this._getTasks(message as GuildMessage);

    while (!task.done && !task.value)
      task = await tasks.next();
  }

  private async * _getTasks(message: GuildMessage): AsyncGenerator<boolean, boolean> {
    yield await this._preventActiveMembersToPostDocLinks(message);
    yield await this._addReactionsInNeededChannels(message);
    yield await this._quoteLinkedMessage(message);
    yield await this._uploadFileOnHastebin(message);
    yield await this._antispamSnippetsChannel(message);
    yield await this._checkCreationsChannelRules(message);
    return false;
  }

  private async _preventActiveMembersToPostDocLinks(message: GuildMessage): Promise<boolean> {
    if (message.member.roles.cache.has(settings.roles.activeMember)
      && (settings.miscellaneous.activeMemberBlacklistedLinks.some(link => message.content.includes(link)))) {
      await message.delete();
      const content = (message.content.length + messages.miscellaneous.noDocLink.length) >= 2000
        ? trimText(message.content, 2000 - messages.miscellaneous.noDocLink.length - 3)
        : message.content;
      await message.author.send(pupa(messages.miscellaneous.noDocLink, { content }));

      return true;
    }
    return false;
  }

  private async _addReactionsInNeededChannels(message: GuildMessage): Promise<boolean> {
    if ([settings.channels.idea, settings.channels.suggestions].includes(message.channel.id)) {
      try {
        await message.react(settings.emojis.yes);
        await message.react(settings.emojis.no);
      } catch (unknownError: unknown) {
        Logger.error('Unable to add emojis to the idea channel.');
        Logger.detail(`Has "ADD_REACTION" permission: ${message.guild.me.permissionsIn(message.channel).has(Permissions.FLAGS.ADD_REACTIONS)}`);
        Logger.detail(`Emojis added: "${settings.emojis.yes}" + "${settings.emojis.no}"`);
        Logger.detail(`Idea channel ID/Current channel ID: ${settings.channels.idea}/${message.channel.id} (same=${settings.channels.idea === message.channel.id})`);
        Logger.detail(`Message: ${message.url}`);
        Logger.error((unknownError as Error).stack);
      }
    }
    return false;
  }

  private async _quoteLinkedMessage(message: GuildMessage): Promise<boolean> {
    const linkRegex = new RegExp(`https://discord(?:app)?.com/channels/${message.guild.id}/(\\d{18})/(\\d{18})`, 'imu');
    if (!linkRegex.test(message.content))
      return false;

    const quotes: Array<{ channelId: string; messageId: string }> = [];
    let text = message.content;
    while (linkRegex.test(text)) {
      const [full, channelId, messageId] = linkRegex.exec(text);
      quotes.push({ channelId, messageId });
      text = text.replace(full, '');
    }

    for (const quote of quotes) {
      const channel = await this.client.channels.fetch(quote.channelId).catch(nullop);
      if (!channel?.isText() || channel.type === 'dm')
        continue;

      const targetedMessage = await channel.messages.fetch(quote.messageId);
      if (!targetedMessage?.content)
        continue;

      const embed = new MessageEmbed()
        .setColor(settings.colors.default)
        .setAuthor(`Message de ${targetedMessage.member?.displayName ?? targetedMessage.author.username}`, targetedMessage.author.avatarURL())
        .setDescription(`${targetedMessage.content}\n[(lien)](${targetedMessage.url})`)
        .setFooter(`Message cité par ${message.member.displayName}.`);

      if (targetedMessage.attachments.size > 0) {
        const attachments = targetedMessage.attachments.array().slice(0, 5);
        for (const [i, attachment] of attachments.entries())
          embed.addField(`Pièce jointe n°${i}`, attachment.url);
      }

      const msg = await message.channel.send(embed);
      const collector = msg
        .createReactionCollector((reaction, user) => user.id === message.author.id
          && (reaction.emoji.id || reaction.emoji.name) === settings.emojis.remove
          && !user.bot)
        .on('collect', async () => {
          await msg.delete().catch(noop);
          collector.stop();
        });

      await msg.react(settings.emojis.remove);
    }
    return false;
  }

  private async _uploadFileOnHastebin(message: GuildMessage): Promise<boolean> {
    const attachment = message.attachments.first();
    if (!attachment || !settings.miscellaneous.hastebinExtensions.some(ext => attachment?.name?.endsWith(ext)))
      return false;

    const attachmentContent = await axios.get(attachment.url).catch(noop);
    if (!attachmentContent)
      return false;

    const response = await axios.post(settings.apis.hastebin, attachmentContent.data).catch(nullop);
    if (!response?.data?.key)
      return false;

    const embed = new MessageEmbed()
      .setColor(settings.colors.default)
      .setDescription(`[Ouvrir le fichier ${attachment.name} sans le télécharger](https://hastebin.com/${response.data.key})`);
    await message.channel.send(embed);

    return false;
  }

  private async _antispamSnippetsChannel(message: GuildMessage): Promise<boolean> {
    if (message.channel.id === settings.channels.snippets
      && !message.member.roles.cache.has(settings.roles.staff)) {
      // We check that they are not the author of the last message in case they exceed the 2.000 chars limit
      // and they want to add details or informations.
      try {
        const previousAuthorId = await message.channel.messages
          .fetch({ before: message.channel.lastMessageID, limit: 1 })
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

export default MessageListener;

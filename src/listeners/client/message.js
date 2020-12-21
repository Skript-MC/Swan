import axios from 'axios';
import { Listener } from 'discord-akairo';
import { DMChannel, Permissions, MessageEmbed } from 'discord.js';
import messages from '../../../config/messages';
import settings from '../../../config/settings';
import Sanction from '../../models/sanction';
import ModerationHelper from '../../moderation/ModerationHelper';
import Logger from '../../structures/Logger';
import { constants, noop, trimText } from '../../utils';

class MessageListener extends Listener {
  constructor() {
    super('message', {
      event: 'message',
      emitter: 'client',
    });
  }

  async confirmBannedMemberSentMessages(message) {
    const isBanned = await ModerationHelper.isBanned(message.member.id, false);
    if (isBanned) {
      try {
        await Sanction.updateOne(
          {
            memberId: message.member.id,
            revoked: false,
            type: constants.SANCTIONS.TYPES.BAN,
          },
          {
            $set: { informations: { hasSentMessage: true } },
          },
        );
      } catch (error) {
        Logger.error('Unable to confirm that the author (which is banned) has sent messages.');
        Logger.detail(`isBanned: ${isBanned}`);
        Logger.detail(`Member ID: ${message.member.id}`);
        Logger.detail(`Message: ${message.url}`);
        Logger.error(error.stack);
        return true;
      }
    }
    return false;
  }

  async preventActiveMembersToPostDocLinks(message) {
    if (message.member.roles.cache.has(settings.roles.activeMember)
      && (message.content.includes('docs.skunity.com') || message.content.includes('skripthub.net/docs/'))) {
      await message.delete();
      const content = message.content.length + messages.miscellaneous.noDocLink.length >= 2000
        ? trimText(message.content, 2000 - messages.miscellaneous.noDocLink.length - 3)
        : message.content;
      await message.author.send(messages.miscellaneous.noDocLink.replace('{MESSAGE}', content));

      return true;
    }
    return false;
  }

  async addReactionsInNeededChannels(message) {
    if ([settings.channels.idea, settings.channels.suggestions].includes(message.channel.id)) {
      try {
        await message.react(settings.emojis.yes);
        await message.react(settings.emojis.no);
      } catch (error) {
        Logger.error('Unable to add emojis to the idea channel.');
        Logger.detail(`Has "ADD_REACTION" permission: ${message.guild.me.permissionsIn(message.channel).has(Permissions.FLAGS.ADD_REACTIONS)}`);
        Logger.detail(`Emojis added: "${settings.emojis.yes}" + "${settings.emojis.no}"`);
        Logger.detail(`Idea channel ID/Current channel ID: ${settings.channels.idea}/${message.channel.id} (same=${settings.channels.idea === message.channel.id})`);
        Logger.detail(`Message: ${message.url}`);
        Logger.error(error.stack);
      }
    }
    return false;
  }

  async quoteLinkedMessage(message) {
    const linkRegex = new RegExp(`https://discord(?:app)?.com/channels/${message.guild.id}/(\\d{18})/(\\d{18})`, 'gimu');
    if (!message.content.match(linkRegex))
      return false;

    const quotes = [];
    let text = message.content;
    while (text.match(linkRegex)) {
      const [full, channelId, messageId] = linkRegex.exec(text);
      quotes.push({ channelId, messageId });
      text = text.replace(full, '');
    }

    for (const quote of quotes) {
      /* eslint-disable no-await-in-loop */
      const channel = await this.client.channels.fetch(quote.channelId);
      if (!channel)
        continue;

      const targetedMessage = await channel.messages.fetch(quote.messageId);
      if (!targetedMessage?.content)
        continue;

      const embed = new MessageEmbed()
        .setColor(settings.colors.default)
        .setAuthor(`Message de ${targetedMessage.member?.displayName || targetedMessage.author.username}`, targetedMessage.author.avatarURL())
        .setDescription(`${targetedMessage.content}\n[(lien)](${targetedMessage.url})`)
        .setFooter(`Message cité par ${message.member.displayName}.`);
      if (targetedMessage.attachments > 0) {
        for (const [i, attachment] of targetedMessage.attachments.slice(0, 5).entries())
          embed.addField(`Pièce jointe n°${i}`, attachment.url);
      }

      const msg = await message.channel.send(embed);
      const collector = msg
        .createReactionCollector((reaction, user) => user.id === message.author.id
          && (reaction.emoji.id || reaction.emoji.name) === settings.emojis.remove
          && !user.bot)
        .on('collect', () => {
          msg.delete();
          collector.stop();
        });

      await msg.react(settings.emojis.remove);
    }
    return false;
  }

  async uploadFileOnHastebin(message) {
    if (message.attachments.size === 0)
      return false;

    const attachment = message.attachments.first();
    if (!settings.miscellaneous.hastebinExtensions.some(ext => attachment.name.endsWith(ext)))
      return false;

    const attachmentContent = await axios.get(attachment.url).catch(noop);
    if (!attachmentContent)
      return false;

    const response = await axios.post(settings.apis.hastebin, attachmentContent.data).catch(noop);
    if (!response?.data?.key)
      return false;

    const embed = new MessageEmbed()
      .setColor(settings.colors.default)
      .setDescription(`[Ouvrir le fichier ${attachment.name} sans le télécharger](https://hastebin.com/${response.data.key})`);
    message.channel.send(embed);
    return false;
  }

  async antispamSnippetsChannel(message) {
    if (message.channel.id === settings.channels.snippet
      && !message.member.roles.cache.has(role => role.id === settings.roles.staff)) {
      // We check that they are not the author of the last message... In case they exceed the 2.000 chars limit
      // and they want to add details or informations, or even just post another snipper.
      try {
        const previousAuthorId = await message.channel.messages
          .fetch({ before: message.channel.lastMessageID, limit: 1 })
          .then(elt => elt.first().author.id);
        if (previousAuthorId !== message.author.id && !message.content.match(/```(?:.|\n)*```/gmu)) {
          await message.delete();
          await message.member.send(messages.miscellaneous.noSpam);
          await message.member.send(message.content);
        }
      } catch { /* Ignored */ }
    }
    return false;
  }

  async checkCreationsChannelRules(message) {
    if (message.channel.id === settings.channels.creations
        && !message.member.roles.cache.has(role => role.id === settings.roles.staff)
        && message?.content
          .match(/(?:https?:\/\/\S+)/g)
          .some(link => !link.match(/(?:https?:\/\/skript-mc\.fr\S+)/g))
    ) {
      await message.delete();
      await message.member.send(messages.miscellaneous.invalidMessage.replace('{CHANNEL}', message.channel));
      await message.member.send(message.content);
    }
  }

  async * getTasks(message) {
    yield await this.confirmBannedMemberSentMessages(message);
    yield await this.preventActiveMembersToPostDocLinks(message);
    yield await this.addReactionsInNeededChannels(message);
    yield await this.quoteLinkedMessage(message);
    yield await this.uploadFileOnHastebin(message);
    yield await this.antispamSnippetsChannel(message);
    yield await this.checkCreationsChannelRules(message);
  }

  async exec(message) {
    const isCommand = Boolean(this.client.commandHandler.parseWithPrefix(message, '=').command);
    if (isCommand || message.author.bot || message.system || message.channel instanceof DMChannel)
      return;

    // Run all needed tasks, and stop when there is either no more tasks or
    // when one returned true (= want to stop)
    let task = { done: false, value: false };
    const tasks = this.getTasks(message);

    while (!task.done && !task.value)
      task = await tasks.next();
  }
}

export default MessageListener;

import { Event } from '@sapphire/framework';
import { DMChannel, User } from 'discord.js';
import type { Message, MessageReaction } from 'discord.js';
import pupa from 'pupa';
import type SwanClient from '@/app/SwanClient';
import MessageLogManager from '@/app/structures/MessageLogManager';
import type { GuildMessage } from '@/app/types';
import { noop } from '@/app/utils';
import messages from '@/conf/messages';
import settings from '@/conf/settings';

export default class MessageDeleteEvent extends Event {
  public override async run(globalMessage: Message): Promise<void> {
    if (globalMessage.channel instanceof DMChannel || !globalMessage.member)
      return;

    const message = globalMessage as GuildMessage;
    await MessageLogManager.saveMessageDelete(this.context.client as SwanClient, message);

    if (message.author.bot
      || message.system
      || message.member.roles.highest.position >= message.guild.roles.cache.get(settings.roles.staff)!.position)
      return;

    // List of all the usernames that were mentionned in the deleted message.
    const userMentions = message.mentions.users
      .array()
      .filter(usr => !usr.bot && usr.id !== message.author.id);
    // List of all the roles name's that were mentionned in the deleted message.
    const roleMentions = message.mentions.roles.array();
    // List of usernames / roles name's that were mentionned.
    const mentions = [...userMentions, ...roleMentions];

    // If no-one was mentionned, then ignore.
    if (mentions.length === 0)
      return;

    // Choose the message (plural if multiple people (or a role) were ghost-ping)
    const severalPeopleAffected = mentions.length > 1 || roleMentions.length > 0;
    const baseMessage = severalPeopleAffected
      ? messages.miscellaneous.ghostPingPlural
      : messages.miscellaneous.ghostPingSingular;

    const botNotificationMessage = await message.channel.send(
      pupa(baseMessage, {
        mentions: mentions
          .map(mention => (mention instanceof User ? mention.username : mention.name))
          .join(', '),
        user: message.member.user,
      }),
    ).catch(noop);
    if (!botNotificationMessage)
      return;

    // If a group of people were ghost-ping, we don't want one people to just remove the alert.
    if (severalPeopleAffected)
      return;

    await botNotificationMessage.react(settings.emojis.remove).catch(noop);
    const collector = botNotificationMessage
      .createReactionCollector(
        (r: MessageReaction, user: User) => (r.emoji.id ?? r.emoji.name) === settings.emojis.remove
          && (user.id === message.mentions.users.first()!.id)
          && !user.bot,
        )
      .on('collect', async () => {
        collector.stop();
        await botNotificationMessage.delete().catch(noop);
      });
  }
}

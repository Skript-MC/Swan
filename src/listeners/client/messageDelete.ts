import { Listener } from '@sapphire/framework';
import type { Message } from 'discord.js';
import { User } from 'discord.js';
import pupa from 'pupa';
import * as messages from '#config/messages';
import { emojis, roles } from '#config/settings';
import * as MessageLogManager from '#structures/MessageLogManager';

export class MessageDeleteListener extends Listener {
  public override async run(message: Message): Promise<void> {
    if (!message.inGuild() || !message.member) return;

    if (message?.content && !message.system)
      await MessageLogManager.saveMessageDelete(
        this.container.client.cache,
        message,
      );

    if (
      message.author.bot ||
      message.system ||
      message.member.roles.highest.position >=
        (message.guild.roles.cache.get(roles.staff)?.position || 0)
    )
      return;

    // List of all the usernames that were mentionned in the deleted message.
    const userMentions = [...message.mentions.users.values()].filter(
      (usr) => !usr.bot && usr.id !== message.author.id,
    );
    // List of all the roles name's that were mentionned in the deleted message.
    const roleMentions = [...message.mentions.roles.values()];
    // List of usernames / roles name's that were mentionned.
    const mentions = [...userMentions, ...roleMentions];

    // If no-one was mentionned, then ignore.
    if (mentions.length === 0) return;

    // Choose the message (plural if multiple people (or a role) were ghost-ping)
    const severalPeopleAffected =
      mentions.length > 1 || roleMentions.length > 0;
    const baseMessage = severalPeopleAffected
      ? messages.miscellaneous.ghostPingPlural
      : messages.miscellaneous.ghostPingSingular;

    const botNotificationMessage = await message.channel.send(
      pupa(baseMessage, {
        mentions: mentions
          .map((mention) =>
            mention instanceof User ? mention.username : mention.name,
          )
          .join(', '),
        user: message.author,
      }),
    );
    if (!botNotificationMessage) return;

    // If a group of people were ghost-ping, we don't want one people to just remove the alert.
    if (severalPeopleAffected) return;

    await botNotificationMessage.react(emojis.remove);
    const collector = botNotificationMessage
      .createReactionCollector({
        filter: (reaction, user) =>
          (reaction.emoji.id ?? reaction.emoji.name) === emojis.remove &&
          user.id === message.mentions.users.first()?.id &&
          !user.bot,
      })
      .on('collect', async () => {
        collector.stop();
        await botNotificationMessage.delete();
      });
  }
}

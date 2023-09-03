import { Listener } from '@sapphire/framework';
import type { MessageReaction } from 'discord.js';
import { User } from 'discord.js';
import pupa from 'pupa';
import * as MessageLogManager from '@/app/structures/MessageLogManager';
import type { GuildMessage } from '@/app/types';
import { noop } from '@/app/utils';
import * as messages from '@/conf/messages';
import { emojis, roles } from '@/conf/settings';

export class MessageUpdateListener extends Listener {
  public override async run(oldMessage: GuildMessage, newMessage: GuildMessage): Promise<void> {
    if (oldMessage?.content && !oldMessage.system)
      await MessageLogManager.saveMessageEdit(this.container.client.cache, oldMessage, newMessage);

    if (newMessage.author.bot
      || newMessage.system
      || newMessage.member.roles.highest.position >= newMessage.guild.roles.cache.get(roles.staff)!.position)
      return;

    // Check for ghostpings.
    // List of all users that were mentionned in the old message.
    const oldUserMentions = [...oldMessage.mentions.users.values()]
      .filter(usr => !usr.bot && usr.id !== newMessage.author.id);
      // List of all roles that were mentionned in the old message.
    const oldRoleMentions = [...oldMessage.mentions.roles.values()];
    // List of usernames / roles name's that were mentionned in the old message.
    const oldMentions = [...oldUserMentions, ...oldRoleMentions];

    // List of all users that are mentionned in the new message.
    const newUserMentions = [...newMessage.mentions.users.values()]
      .filter(usr => !usr.bot && usr.id !== newMessage.author.id);
    // List of all roles that are mentionned in the new message.
    const newRoleMentions = [...newMessage.mentions.roles.values()];
    // List of usernames / roles name's that are mentionned in the new message.
    const newMentions = [...newUserMentions, ...newRoleMentions];

    // Filter out all the mentions that were in the previous message *and* in the new message.
    const deletedMentions = oldMentions.filter(
      oldMention => !newMentions.some(newMention => oldMention.id === newMention.id),
    );
    if (deletedMentions.length === 0)
      return;

    // Gt all the deleted role menttions
    const deletedRoleMentions = oldRoleMentions.filter(
      oldRoleMention => !newRoleMentions.some(newRoleMention => oldRoleMention.id === newRoleMention.id),
    );
    const severalPeopleAffected = deletedMentions.length > 1 || deletedRoleMentions.length > 0;

    // Choose the message (plural if multiple people (or a role) were ghost-ping)
    const baseMessage = severalPeopleAffected
      ? messages.miscellaneous.ghostPingPlural
      : messages.miscellaneous.ghostPingSingular;

    const botNotificationMessage = await newMessage.channel.send(
      pupa(baseMessage, {
        mentions: deletedMentions
          .map(mention => (mention instanceof User ? mention.username : mention.name))
          .join(', '),
        user: newMessage.member.user,
      }),
    ).catch(noop);
    if (!botNotificationMessage)
      return;

    // If a group of people were ghost-ping, we don't want one people to just remove the alert.
    if (severalPeopleAffected)
      return;

    await botNotificationMessage.react(emojis.remove).catch(noop);
    const collector = botNotificationMessage
      .createReactionCollector({
        filter: (r: MessageReaction, user: User) => (r.emoji.id ?? r.emoji.name) === emojis.remove
          && (user.id === deletedMentions[0].id)
          && !user.bot,
      }).on('collect', async () => {
        collector.stop();
        await botNotificationMessage.delete().catch(noop);
      });
  }
}

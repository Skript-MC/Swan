import { Listener } from 'discord-akairo';
import { User } from 'discord.js';
import type { MessageReaction } from 'discord.js';
import pupa from 'pupa';
import type { GuildMessage } from '@/app/types';
import { noop, trimText } from '@/app/utils';
import messages from '@/conf/messages';
import settings from '@/conf/settings';

class MessageUpdateListener extends Listener {
  constructor() {
    super('messageUpdate', {
      event: 'messageUpdate',
      emitter: 'client',
    });
  }

  public async exec(oldMessage: GuildMessage, newMessage: GuildMessage): Promise<void> {
    // Prevent active members from posting another documentation than Skript-MC's.
    if (newMessage.member.roles.cache.has(settings.roles.activeMember)
      && (settings.miscellaneous.activeMemberBlacklistedLinks.some(link => newMessage.content.includes(link)))) {
      await newMessage.delete();
      const content = (oldMessage.content.length + messages.miscellaneous.noDocLink.length) >= 2000
        ? trimText(oldMessage.content, 2000 - messages.miscellaneous.noDocLink.length - 3)
        : oldMessage.content;
      await newMessage.author.send(pupa(messages.miscellaneous.noDocLink, { content }));

      return;
    }

    // Check for ghostpings.
    if (newMessage.author.bot
      || newMessage.system
      || newMessage.member.roles.highest.position >= newMessage.guild.roles.cache.get(settings.roles.staff)!.position)
      return;

    // List of all users that were mentionned in the old message.
    const oldUserMentions = oldMessage.mentions.users
      .array()
      .filter(usr => !usr.bot && usr.id !== newMessage.author.id);
      // List of all roles that were mentionned in the old message.
    const oldRoleMentions = oldMessage.mentions.roles.array();
    // List of usernames / roles name's that were mentionned in the old message.
    const oldMentions = [...oldUserMentions, ...oldRoleMentions];

    // List of all users that are mentionned in the new message.
    const newUserMentions = newMessage.mentions.users
      .array()
      .filter(usr => !usr.bot && usr.id !== newMessage.author.id);
    // List of all roles that are mentionned in the new message.
    const newRoleMentions = newMessage.mentions.roles.array();
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
        member: newMessage.member,
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
          && (user.id === deletedMentions[0].id)
          && !user.bot,
        )
      .on('collect', async () => {
        collector.stop();
        await botNotificationMessage.delete().catch(noop);
      });
  }
}

export default MessageUpdateListener;

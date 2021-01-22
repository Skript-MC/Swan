import { Listener } from 'discord-akairo';
import pupa from 'pupa';
import messages from '../../../config/messages';
import settings from '../../../config/settings';
import type { GuildMessage } from '../../types';
import { noop, trimText } from '../../utils';

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

    const oldUserMentions = oldMessage.mentions.users
      .array()
      .filter(usr => !usr.bot && usr.id !== newMessage.author.id)
      .map(usr => usr.username);
    const oldRoleMentions = oldMessage.mentions.roles
      .array()
      .map(role => role.name);
    const oldMentions = [...oldUserMentions, ...oldRoleMentions];

    const newUserMentions = newMessage.mentions.users
      .array()
      .filter(usr => !usr.bot && usr.id !== newMessage.author.id)
      .map(usr => usr.username);
    const newRoleMentions = newMessage.mentions.roles
      .array()
      .map(role => role.name);
    const newMentions = new Set(...newUserMentions, ...newRoleMentions);

    const deletedMentions = oldMentions.filter(mention => !newMentions.has(mention));
    if (deletedMentions.length === 0)
      return;

    const deletedRoleMentions = oldRoleMentions.filter(mention => !newRoleMentions.includes(mention)).length > 0;

    const baseMessage = deletedMentions.length > 1 || deletedRoleMentions
      ? messages.miscellaneous.ghostPingPlural
      : messages.miscellaneous.ghostPingSingular;

    await newMessage.channel.send(pupa(baseMessage, { mentions: deletedMentions.join(', '), member: newMessage.member }))
      .catch(noop);
  }
}

export default MessageUpdateListener;

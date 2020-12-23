import { Listener } from 'discord-akairo';
import type { Message } from 'discord.js';
import messages from '../../../config/messages';
import settings from '../../../config/settings';
import { noop } from '../../utils';

class MessageUpdateListener extends Listener {
  constructor() {
    super('messageUpdate', {
      event: 'messageUpdate',
      emitter: 'client',
    });
  }

  public async exec(oldMessage: Message, newMessage: Message): Promise<void> {
    if (newMessage.author.bot
      || newMessage.system
      || newMessage.member.roles.highest.position >= newMessage.guild.roles.cache.get(settings.roles.staff).position)
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

    await newMessage.channel.send(
      baseMessage
        .replace('{MENTIONS}', deletedMentions.join(', '))
        .replace('{MEMBER}', newMessage.member.displayName),
    ).catch(noop);
  }
}

export default MessageUpdateListener;

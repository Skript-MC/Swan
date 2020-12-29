import { Listener } from 'discord-akairo';
import type { Message } from 'discord.js';
import messages from '../../../config/messages';
import settings from '../../../config/settings';
import { noop } from '../../utils';

class MessageDeleteListener extends Listener {
  constructor() {
    super('messageDelete', {
      event: 'messageDelete',
      emitter: 'client',
    });
  }

  public async exec(message: Message): Promise<void> {
    if (message.author.bot
      || message.system
      || message.member?.roles.highest.position >= message.guild.roles.cache.get(settings.roles.staff).position)
      return;

    const userMentions = message.mentions.users
      .array()
      .filter(usr => !usr.bot && usr.id !== message.author.id)
      .map(usr => usr.username);
    const roleMentions = message.mentions.roles
      .array()
      .map(role => role.name);
    const mentions = [...userMentions, ...roleMentions];

    if (userMentions.length === 0 && roleMentions.length === 0)
      return;

    const deletedRoleMentions = roleMentions.length > 0;

    const baseMessage = mentions.length > 1 || deletedRoleMentions
      ? messages.miscellaneous.ghostPingPlural
      : messages.miscellaneous.ghostPingSingular;

    await message.channel.send(
      baseMessage
        .replace('{MENTIONS}', mentions.join(', '))
        .replace('{MEMBER}', message.member.displayName),
    ).catch(noop);
  }
}

export default MessageDeleteListener;

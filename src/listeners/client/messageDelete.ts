import { Listener } from 'discord-akairo';
import { DMChannel } from 'discord.js';
import type { Message } from 'discord.js';
import pupa from 'pupa';
import messages from '../../../config/messages';
import settings from '../../../config/settings';
import type { GuildMessage } from '../../types';
import { noop } from '../../utils';

class MessageDeleteListener extends Listener {
  constructor() {
    super('messageDelete', {
      event: 'messageDelete',
      emitter: 'client',
    });
  }

  public async exec(globalMessage: Message): Promise<void> {
    if (globalMessage.channel instanceof DMChannel)
      return;

    const message = globalMessage as GuildMessage;

    const memberPosition = message.member.roles.highest.position;
    const maxPosition = message.guild.roles.cache.get(settings.roles.staff)?.position ?? 0;
    if (message.author.bot || message.system || memberPosition >= maxPosition)
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

    await message.channel.send(pupa(baseMessage, { mentions: mentions.join(', '), member: message.member }))
      .catch(noop);
  }
}

export default MessageDeleteListener;

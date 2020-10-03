import { Listener } from 'discord-akairo';
import messages from '../../../config/messages';
import settings from '../../../config/settings';

class MessageDeleteListener extends Listener {
  constructor() {
    super('messageDelete', {
      event: 'messageDelete',
      emitter: 'client',
    });
  }

  async exec(message) {
    if (message.author.bot || message.system)
      return;
    if (message.member.roles.highest.position >= message.guild.roles.cache.get(settings.roles.staff).position)
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

    message.channel.send(
      baseMessage
        .replace('{MENTIONS}', mentions.join(', '))
        .replace('{MEMBER}', message.member.displayName),
    );
  }
}

export default MessageDeleteListener;

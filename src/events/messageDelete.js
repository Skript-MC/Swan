/* eslint-disable import/no-cycle */
import { config } from '../main';

export default async function messageDeleteHandler(message) {
  if (message.author.bot) return; // The bot has a ghost-ping command
  if (message.member.roles.highest.position >= message.guild.roles.cache.get(config.roles.staff).position) return;
  if (message.mentions.users.size === 0 && message.mentions.roles.size === 0) return;

  const mentions = [
    ...message.mentions.users.array().map(elt => elt.username),
    ...message.mentions.roles.array().map(elt => elt.name),
  ];
  message.channel.send(
    config.messages.miscellaneous.ghostping
      .replace('%s', mentions.join(', '))
      .replace('%m', message.member.nickname || message.author.username),
  );
}

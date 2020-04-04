/* eslint-disable import/no-cycle */
import { config } from '../main';

export default async function messageDeleteHandler(message) {
  if (message.author.bot) return; // The bot has a ghost-ping command
  if (message.member.roles.highest.position >= message.guild.roles.cache.get(config.roles.staff).position) return;

  const userMentions = message.mentions.users.array().filter(usr => !usr.bot).map(usr => usr.username);
  const roleMentions = message.mentions.roles.array().map(role => role.name);
  const mentions = [...userMentions, ...roleMentions];

  if (userMentions.length === 0 && roleMentions.length === 0) return;

  const deletedRoleMention = roleMentions.length > 0;

  const baseMessage = mentions.length > 1 || deletedRoleMention
    ? config.messages.miscellaneous.ghostpingPlural
    : config.messages.miscellaneous.ghostping;

  message.channel.send(
    baseMessage
      .replace('%s', mentions.join(', '))
      .replace('%m', message.member.nickname || message.author.username),
  );
}

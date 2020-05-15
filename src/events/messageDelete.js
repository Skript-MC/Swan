import { client } from '../main';

export default async function messageDeleteHandler(message) {
  if (message.author.bot) return; // The bot has a ghost-ping command
  if (message.member.roles.highest.position >= message.guild.roles.cache.get(client.config.roles.staff).position) return;

  const userMentions = message.mentions.users.array().filter(usr => !usr.bot && usr.id !== message.author.id).map(usr => usr.username);
  const roleMentions = message.mentions.roles.array().map(role => role.name);
  const mentions = [...userMentions, ...roleMentions];

  if (userMentions.length === 0 && roleMentions.length === 0) return;

  const deletedRoleMention = roleMentions.length > 0;

  const baseMessage = mentions.length > 1 || deletedRoleMention
    ? client.config.messages.miscellaneous.ghostpingPlural
    : client.config.messages.miscellaneous.ghostping;

  message.channel.send(
    baseMessage
      .replace('%s', mentions.join(', '))
      .replace('%m', message.member.displayName),
  );
}

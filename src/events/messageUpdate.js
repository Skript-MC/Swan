/* eslint-disable import/no-cycle */
import { config } from '../main';

export default async function messageUpdateHandler(oldMessage, newMessage) {
  if (newMessage.author.bot) return; // The bot has a ghost-ping command
  if (newMessage.member.roles.highest.position >= newMessage.guild.roles.cache.get(config.roles.staff).position) return;

  const oldUserMentions = oldMessage.mentions.users.array().filter(usr => !usr.bot).map(usr => usr.username);
  const oldRoleMentions = oldMessage.mentions.roles.array().map(role => role.name);
  const oldMentions = [...oldUserMentions, ...oldRoleMentions];

  const newUserMentions = newMessage.mentions.users.array().map(usr => usr.username);
  const newRoleMentions = newMessage.mentions.roles.array().map(role => role.name);
  const newMentions = [...newUserMentions, ...newRoleMentions];

  const deletedMentions = oldMentions.filter(elt => !newMentions.includes(elt));
  if (deletedMentions.length === 0) return;

  // FIXME: Make this work (it does not work due to a current discordjs bug)
  const deletedRoleMention = oldRoleMentions.filter(elt => !newRoleMentions.includes(elt)).length > 0;

  const baseMessage = deletedMentions.length > 1 || deletedRoleMention
    ? config.messages.miscellaneous.ghostpingPlural
    : config.messages.miscellaneous.ghostping;

  newMessage.channel.send(
    baseMessage
      .replace('%s', deletedMentions.join(', '))
      .replace('%m', newMessage.member.nickname || newMessage.author.username),
  );
}

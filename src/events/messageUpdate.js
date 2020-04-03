/* eslint-disable import/no-cycle */
import { config } from '../main';

export default async function messageUpdateHandler(oldMessage, newMessage) {
  if (newMessage.author.bot) return; // The bot has a ghost-ping command
  // if (newMessage.member.roles.highest.position >= newMessage.guild.roles.cache.get(config.roles.staff).position) return;
  if (oldMessage.mentions.users.size === 0 && oldMessage.mentions.roles.size === 0) return;

  const oldUserMentions = oldMessage.mentions.users.array().map(elt => elt.username);
  const oldRoleMentions = oldMessage.mentions.roles.array().map(elt => elt.name);
  const oldMentions = [...oldUserMentions, ...oldRoleMentions];

  const newUserMentions = newMessage.mentions.users.array().map(elt => elt.username);
  const newRoleMentions = newMessage.mentions.roles.array().map(elt => elt.name);
  const newMentions = [...newUserMentions, ...newRoleMentions];

  const deletedMentions = oldMentions.filter(elt => !newMentions.includes(elt));
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

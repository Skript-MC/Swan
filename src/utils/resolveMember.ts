import { UserOrMemberMentionRegex } from '@sapphire/discord-utilities';
import { Store } from '@sapphire/pieces';
import type { GuildMember } from 'discord.js';

function checkMember(text: string, member: GuildMember, caseSensitive = false, wholeWord = false): boolean {
  if (member.id === text)
    return true;

  const match = UserOrMemberMentionRegex.exec(text);
  if (match && member.id === match[1])
    return true;

  text = caseSensitive ? text : text.toLowerCase();
  const username = caseSensitive ? member.user.username : member.user.username.toLowerCase();
  const displayName = caseSensitive ? member.displayName : member.displayName.toLowerCase();
  const discrim = member.user.discriminator;

  if (!wholeWord) {
    return displayName.includes(text)
      || username.includes(text)
      || ((username.includes(text.split('#')[0]) || displayName.includes(text.split('#')[0])) && discrim.includes(text.split('#')[1]));
  }

  return displayName === text
    || username === text
    || ((username === text.split('#')[0] || displayName === text.split('#')[0]) && discrim === text.split('#')[1]);
}

export default function resolveMember(text: string, caseSensitive = false, wholeWord = false): GuildMember {
  const members = Store.injectedContext.client.guild.members.cache;
  return members.get(text) || members.find(member => checkMember(text, member, caseSensitive, wholeWord));
}

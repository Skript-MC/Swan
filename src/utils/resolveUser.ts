import { UserOrMemberMentionRegex } from '@sapphire/discord-utilities';
import { container } from '@sapphire/pieces';
import type { User } from 'discord.js';

function checkUser(text: string, user: User, caseSensitive = false, wholeWord = false): boolean {
  if (user.id === text)
    return true;

  const match = UserOrMemberMentionRegex.exec(text);
  if (match && user.id === match[1])
    return true;

  text = caseSensitive ? text : text.toLowerCase();
  const username = caseSensitive ? user.username : user.username.toLowerCase();
  const discrim = user.discriminator;

  if (!wholeWord) {
    return username.includes(text)
      || (username.includes(text.split('#')[0]) && discrim.includes(text.split('#')[1]));
  }

  return username === text
    || (username === text.split('#')[0] && discrim === text.split('#')[1]);
}

export default function resolveUser(text: string, caseSensitive = false, wholeWord = false): User {
  const users = container.client.users.cache;
  return users.get(text) ?? users.find(user => checkUser(text, user, caseSensitive, wholeWord));
}

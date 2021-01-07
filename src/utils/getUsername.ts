import type { AkairoClient } from 'discord-akairo';
import type { GuildMember, User } from 'discord.js';
import messages from '../../config/messages';
import getPersonFromCache from './getPersonFromCache';

/**
 * Get the displayName or username of the given person, or the ID if it is not available.
 *
 * @param {GuildMember | User | string} personResolvable - The GuildMember/User/ID to get the name from.
 * @param {AkairoClient?} client - The client used to fetch the member/user from cache, if we only get a string.
 * @returns string
 */
function getUsername(personResolvable: GuildMember | User | string, client: AkairoClient): string {
  const person = getPersonFromCache(personResolvable, client);
  return person.member?.displayName ?? person.user?.username ?? person.id ?? messages.global.unknownName;
}

export default getUsername;

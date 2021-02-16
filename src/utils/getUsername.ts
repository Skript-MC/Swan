import type { User } from 'discord.js';
import { GuildMember } from 'discord.js';

/**
 * Get the displayName or username of the given person, or the ID if it is not available.
 * @param {GuildMember | User | string} personResolvable - The GuildMember/User/ID to get the name from.
 * @param {AkairoClient?} client - The client used to fetch the member/user from cache, if we only get a string.
 * @returns string
 */
function getUsername(user: GuildMember | User | string): string {
  return typeof user === 'string'
    ? user
    : (user instanceof GuildMember
      ? user.displayName
      : user.username
    );
}

export default getUsername;

import type { User } from 'discord.js';
import { GuildMember } from 'discord.js';

/**
 * Get the displayName or username of the given person, or the ID if it is not available.
 * @param {GuildMember | User | string} user - The GuildMember/User/ID to get the name from.
 * @returns string
 */
export default function getUsername(user: GuildMember | User | string): string {
  return typeof user === 'string'
    ? user
    : (user instanceof GuildMember
      ? user.displayName
      : user.username
    );
}

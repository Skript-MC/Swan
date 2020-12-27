import type { User } from 'discord.js';
import { GuildMember } from 'discord.js';

function getUsername(user: GuildMember | User | string): string {
  return typeof user === 'string'
    ? user
    : (user instanceof GuildMember
      ? user.displayName
      : user.username
    );
}

export default getUsername;

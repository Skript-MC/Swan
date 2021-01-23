import type { AkairoClient } from 'discord-akairo';
import { GuildMember, User } from 'discord.js';
import type { PersonInformations } from '@/app/types';

/**
 * Get the id, the member and the user of a person from the cache.
 *
 * @param {GuildMember | User | string} personResolvable - The data to fetch the member/user from.
 * @param {AkairoClient} client - The client to get the guild and the users from.
 * @param {boolean = false} resolveMemberAndUser - Whether it should throw if we don't get both the member and the user.
 * @returns PersonInformations
 */
function getPersonFromCache(
  personResolvable: GuildMember | User | string,
  client: AkairoClient,
  resolveMemberAndUser = true,
): PersonInformations {
  // Get the GuildMember from the personResolvable or the cache.
  const member: GuildMember = personResolvable instanceof GuildMember
    ? personResolvable
    : client.guild.members.resolve(personResolvable);

  // Get the User from the member, the personResolvable or the cache.
  const user: User = personResolvable instanceof User
    ? personResolvable
    : member?.user ?? client.users.resolve(personResolvable);

  const missingData = resolveMemberAndUser
    ? !member || !user // If we are missing either the member or the user
    : !member && !user; // If we are missing both the member and the user
  if (missingData)
    throw new TypeError('Victim Not Found');

  return {
    id: (member || user).id,
    user,
    member,
  };
}

export default getPersonFromCache;

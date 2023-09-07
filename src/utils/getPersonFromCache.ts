import type { GuildMember, User } from 'discord.js';
import type { PersonInformations } from '#types/index';
import { resolveMember } from '#utils/resolveMember';
import { resolveUser } from '#utils/resolveUser';

/**
 * Get the id, the member and the user of a person from the cache.
 * @param {GuildMember | User | string} personResolvable - The data to fetch the member/user from.
 * @param {AkairoClient} client - The client to get the guild and the users from.
 * @param {boolean = false} resolveMemberAndUser - Whether it should throw if we don't get both the member and the user.
 * @returns PersonInformations
 * @throws {TypeError} - If not enough data was gathered, it will throw a TypeError
 */
export function getPersonFromCache(
  personResolvable: GuildMember | User | string,
  resolveMemberAndUser = true,
): PersonInformations {
  const member = resolveMember(personResolvable.toString());
  const user = member?.user ?? resolveUser(personResolvable.toString());

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

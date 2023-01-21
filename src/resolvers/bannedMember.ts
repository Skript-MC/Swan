import { SnowflakeRegex, UserOrMemberMentionRegex } from '@sapphire/discord-utilities';
import type { Result } from '@sapphire/framework';
import { ok, Resolvers } from '@sapphire/framework';
import type { Guild, GuildMember, User } from 'discord.js';
import { nullop, resolveUser } from '@/app/utils';

export default async function resolveBannedMember(
  parameter: string,
  guild: Guild,
): Promise<Result<GuildMember | User, 'bannedMemberError'>> {
  // Resolve to member
  const member = await Resolvers.resolveMember(parameter, guild);
  if (member.isOk())
    return member;

  // Resolve to user
  const user = await Resolvers.resolveUser(parameter);
  if (user.isOk())
    return user;

  // Resolve to user, with our own heuristic
  const resolvedUser = resolveUser(parameter);
  if (resolvedUser)
    return ok(resolvedUser);

  // Extract the ID from the parameter
  let resolvedPerson: GuildMember | User | undefined;
  const id = UserOrMemberMentionRegex.exec(parameter)?.groups?.id || SnowflakeRegex.exec(parameter)?.groups?.id;
  // If we found a valid ID, try resolving the User from cache
  if (id) {
    resolvedPerson = resolveUser(id)
      // If it is not found in the cache, try fetching it
      || await this.container.client.users.fetch(id).catch(nullop)
      // If we failed to fetch it, look in the Discord's bans
      // eslint-disable-next-line unicorn/no-await-expression-member
      || (await guild.bans.fetch(id).catch(nullop))?.user
      || null;
  }
  return ok(resolvedPerson);
}

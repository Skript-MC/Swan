import type { Result } from '@sapphire/framework';
import { err, ok, Resolvers } from '@sapphire/framework';
import type { Guild, GuildMember } from 'discord.js';

export default async function resolveSanctionnableMember(
  parameter: string,
  guild: Guild,
  moderator: GuildMember,
): Promise<Result<GuildMember, 'sanctionnableMemberError'>> {
  const member = await Resolvers.resolveMember(parameter, guild);
  if (!member.success)
    return err('sanctionnableMemberError');

  if (member.value.id !== moderator.id && member.value.roles.highest.position < moderator.roles.highest.position)
    return ok(member.value);
  return err('sanctionnableMemberError');
}

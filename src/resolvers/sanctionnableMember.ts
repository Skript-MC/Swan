import type { Result } from '@sapphire/framework';
import { err, ok } from '@sapphire/framework';
import type { GuildMember } from 'discord.js';

export function resolveSanctionnableMember(
  member: GuildMember,
  moderator: GuildMember,
): Result<GuildMember, 'sanctionnableMemberError'> {
  if (
    member.id !== moderator.id &&
    member.roles.highest.position < moderator.roles.highest.position
  )
    return ok(member);
  return err('sanctionnableMemberError');
}

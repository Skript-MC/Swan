import type { ArgumentContext, AsyncArgumentResult } from '@sapphire/framework';
import { Argument } from '@sapphire/framework';
import type { GuildMember } from 'discord.js';
import CustomResolvers from '@/app/resolvers';

export default class SanctionnableMemberArgument extends Argument<GuildMember> {
  public async run(parameter: string, context: ArgumentContext<GuildMember>): AsyncArgumentResult<GuildMember> {
    const resolved = await CustomResolvers.resolveSanctionnableMember(
      parameter,
      context.message.guild,
      context.message.member,
    );

    if (resolved.success)
      return this.ok(resolved.value);
    return this.error({
      parameter,
      identifier: resolved.error,
      message: 'The argument did not resolve to a sanctionnable member.',
      context,
    });
  }
}

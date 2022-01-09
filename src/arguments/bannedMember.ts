import type { ArgumentContext, AsyncArgumentResult } from '@sapphire/framework';
import { Argument } from '@sapphire/framework';
import type { GuildMember, User } from 'discord.js';
import CustomResolvers from '../resolvers';

export default class BannedMemberArgument extends Argument<GuildMember | User> {
  public override async run(
    parameter: string,
    context: ArgumentContext<GuildMember | User>,
  ): AsyncArgumentResult<GuildMember | User> {
    const resolved = await CustomResolvers.resolveBannedMember(parameter, context.message.guild);

    if (resolved.success)
      return this.ok(resolved.value);
    return this.error({
      parameter,
      identifier: resolved.error,
      message: 'The argument did not resolve to a banned member.',
      context,
    });
  }
}

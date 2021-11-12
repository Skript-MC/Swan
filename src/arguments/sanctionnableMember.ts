import type { ArgumentContext, AsyncArgumentResult } from '@sapphire/framework';
import { Argument, Resolvers } from '@sapphire/framework';
import type { GuildMember } from 'discord.js';

export default class SanctionnableMemberArgument extends Argument<GuildMember> {
  public async run(parameter: string, context: ArgumentContext<GuildMember>): AsyncArgumentResult<GuildMember> {
    const member = await Resolvers.resolveMember(parameter, this.container.client.guild);
    const moderator = context.args.message.member;

    return member.value.id !== moderator.id && member.value.roles.highest.position < moderator.roles.highest.position
      ? this.ok(member.value)
      : this.error({
          parameter,
          message: 'The argument did not resolve to a sanctionnable member.',
          context,
        });
  }
}

import { ApplyOptions } from '@sapphire/decorators';
import type { ArgumentResult, ExtendedArgumentContext, ExtendedArgumentOptions } from '@sapphire/framework';
import { ExtendedArgument } from '@sapphire/framework';
import type { GuildMember } from 'discord.js';

@ApplyOptions<ExtendedArgumentOptions<'member'>>({ name: 'sanctionnableMember', baseArgument: 'member' })
export default class GuildTextBasedChannelArgument extends ExtendedArgument<'member', GuildMember> {
  public handle(member: GuildMember, context: ExtendedArgumentContext): ArgumentResult<GuildMember> {
    const moderator = context.args.message.member;

    return member.id !== moderator.id && member.roles.highest.position < moderator.roles.highest.position
      ? this.ok(member)
      : this.error({
          parameter: context.parameter,
          message: 'The argument did not resolve to a sanctionnable member.',
          context: { ...context, member },
        });
  }
}

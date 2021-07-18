import { SnowflakeRegex, UserOrMemberMentionRegex } from '@sapphire/discord-utilities';
import type { ArgumentContext, AsyncArgumentResult } from '@sapphire/framework';
import { Argument } from '@sapphire/framework';
import type { GuildMember, User } from 'discord.js';
import { nullop, resolveUser } from '../utils';

export default class BannedMemberArgument extends Argument<GuildMember | User> {
  public override async run(
    parameter: string,
    context: ArgumentContext<GuildMember | User>,
  ): AsyncArgumentResult<GuildMember | User> {
    const memberArgument = this.context.stores.get('arguments').get('member') as Argument<GuildMember>;
    const member = await memberArgument.run(parameter, { ...context, argument: memberArgument });
    if (member.success)
      return this.ok(member.value);

    const userArgument = this.context.stores.get('arguments').get('user') as Argument<User>;
    const user = await userArgument.run(parameter, { ...context, argument: userArgument });
    if (user.success)
      return this.ok(user.value);

    const resolvedUser = resolveUser(parameter);
    if (resolvedUser)
      return this.ok(resolvedUser);

    let resolvedMember: GuildMember | User | undefined;
    const id = UserOrMemberMentionRegex.exec(parameter)?.groups?.id
      || SnowflakeRegex.exec(parameter)?.groups?.id;
    // If we found a valid ID, try resolving the User from cache
    if (id) {
      resolvedMember = resolveUser(id)
        // If it is not found in the cache, try fetching it
        || await this.context.client.users.fetch(id).catch(nullop)
        // If we failed to fetch it, look in the Discord's bans
        || (await context.message.guild.fetchBan(id).catch(nullop))?.user
        || null;
    }
    if (resolvedMember)
      return this.ok(resolvedMember);

    return this.error({ parameter });
  }
}

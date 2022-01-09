import { SnowflakeRegex, UserOrMemberMentionRegex } from '@sapphire/discord-utilities';
import type { ArgumentContext, AsyncArgumentResult } from '@sapphire/framework';
import { Argument, Resolvers } from '@sapphire/framework';
import type { GuildMember, User } from 'discord.js';
import { nullop, resolveUser } from '../utils';

export default class BannedMemberArgument extends Argument<GuildMember | User> {
  public override async run(
    parameter: string,
    context: ArgumentContext<GuildMember | User>,
  ): AsyncArgumentResult<GuildMember | User> {
    // Resolve to member
    const member = await Resolvers.resolveMember(parameter, this.container.client.guild);
    if (member.success)
      return this.ok(member.value);

    // Resolve to user
    const user = await Resolvers.resolveUser(parameter);
    if (user.success)
      return this.ok(user.value);

    // Resolve to user, with our own heuristic
    const resolvedUser = resolveUser(parameter);
    if (resolvedUser)
      return this.ok(resolvedUser);

    // Extract the ID from the parameter
    let resolvedPerson: GuildMember | User | undefined;
    const id = UserOrMemberMentionRegex.exec(parameter)?.groups?.id
      || SnowflakeRegex.exec(parameter)?.groups?.id;
    // If we found a valid ID, try resolving the User from cache
    if (id) {
      resolvedPerson = resolveUser(id)
        // If it is not found in the cache, try fetching it
        || await this.container.client.users.fetch(id).catch(nullop)
        // If we failed to fetch it, look in the Discord's bans
        // eslint-disable-next-line unicorn/no-await-expression-member
        || (await context.message.guild.bans.fetch(id).catch(nullop))?.user
        || null;
    }
    if (resolvedPerson)
      return this.ok(resolvedPerson);

    return this.error({ parameter });
  }
}

import type { ArgumentContext, ArgumentResult } from '@sapphire/framework';
import { Argument } from '@sapphire/framework';
import type { GuildTextBasedChannel } from 'discord.js';
import CustomResolvers from '@/app/resolvers';

export default class GuildTextBasedChannelArgument extends Argument<GuildTextBasedChannel> {
  public override run(
    parameter: string,
    context: ArgumentContext<GuildTextBasedChannel>,
  ): ArgumentResult<GuildTextBasedChannel> {
    const resolved = CustomResolvers.resolveGuildTextBasedChannel(parameter, context.message.guild);

    if (resolved.success)
      return this.ok(resolved.value);
    return this.error({
      parameter,
      identifier: resolved.error,
      message: 'The argument did not resolve to a guild text based channel.',
      context,
    });
  }
}

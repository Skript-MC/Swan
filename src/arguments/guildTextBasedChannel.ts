import { isGuildBasedChannel, isTextBasedChannel } from '@sapphire/discord.js-utilities';
import type { ArgumentContext, ArgumentResult } from '@sapphire/framework';
import { Argument, Resolvers } from '@sapphire/framework';
import type { GuildTextBasedChannel } from 'discord.js';

export default class GuildTextBasedChannelArgument extends Argument<GuildTextBasedChannel> {
  public override run(
    parameter: string,
    context: ArgumentContext<GuildTextBasedChannel>,
  ): ArgumentResult<GuildTextBasedChannel> {
    const resolved = Resolvers.resolveChannel(parameter, context.message);

    return isTextBasedChannel(resolved.value) && isGuildBasedChannel(resolved.value)
      ? this.ok(resolved.value)
      : this.error({
        parameter,
        message: 'The argument did not resolve to a guild text-based channel.',
        context,
      });
  }
}

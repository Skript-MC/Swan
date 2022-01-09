import type { ArgumentContext, ArgumentResult } from '@sapphire/framework';
import { Argument } from '@sapphire/framework';
import type { GuildEmoji } from 'discord.js';
import CustomResolvers from '@/app/resolvers';

export default class EmojiArgument extends Argument<GuildEmoji> {
  public override run(parameter: string, context: ArgumentContext<GuildEmoji>): ArgumentResult<GuildEmoji> {
    const resolved = CustomResolvers.resolveEmoji(parameter, context.message.guild);

    if (resolved.success)
      return this.ok(resolved.value);
    return this.error({
      parameter,
      identifier: resolved.error,
      message: 'The argument did not resolve to an emoji.',
      context,
    });
  }
}

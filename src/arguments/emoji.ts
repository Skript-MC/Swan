import type { ArgumentContext, ArgumentResult } from '@sapphire/framework';
import { Argument } from '@sapphire/framework';
import CustomResolvers from '@/app/resolvers';

export default class EmojiArgument extends Argument<string> {
  public override run(parameter: string, context: ArgumentContext<string>): ArgumentResult<string> {
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

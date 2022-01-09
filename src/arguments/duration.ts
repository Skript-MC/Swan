import type { ArgumentContext, ArgumentResult } from '@sapphire/framework';
import { Argument } from '@sapphire/framework';
import CustomResolvers from '@/app/resolvers';

export default class DurationArgument extends Argument<number> {
  public override run(parameter: string, context: ArgumentContext<number>): ArgumentResult<number> {
    const resolved = CustomResolvers.resolveDuration(parameter);

    if (resolved.success)
      return this.ok(resolved.value);
    return this.error({
      parameter,
      identifier: resolved.error,
      message: 'The argument did not resolve to a duration.',
      context,
    });
  }
}

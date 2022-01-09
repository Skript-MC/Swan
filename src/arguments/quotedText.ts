import type { ArgumentContext, ArgumentResult } from '@sapphire/framework';
import { Argument } from '@sapphire/framework';
import CustomResolvers from '../resolvers';

export default class QuotedTextArgument extends Argument<string[]> {
  public override run(parameter: string, context: ArgumentContext<string[]>): ArgumentResult<string[]> {
    const resolved = CustomResolvers.resolveQuotedText(parameter);

    if (resolved.success)
      return this.ok(resolved.value);
    return this.error({
      parameter,
      identifier: resolved.error,
      message: 'The argument did not resolve to a quoted text.',
      context,
    });
  }
}

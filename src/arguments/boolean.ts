import type { ArgumentContext, AsyncArgumentResult } from '@sapphire/framework';
import { Argument, Resolvers } from '@sapphire/framework';
import settings from '@/conf/settings';

const truths = settings.miscellaneous.booleanTruths;
const falses = settings.miscellaneous.booleanFalses;

export default class BooleanArgument extends Argument<boolean> {
  public async run(parameter: string, context: ArgumentContext<boolean>): AsyncArgumentResult<boolean> {
    const resolved = Resolvers.resolveBoolean(parameter, { truths, falses });

    if (resolved.success)
      return this.ok(resolved.value);
    return this.error({
      parameter,
      identifier: resolved.error,
      message: 'The argument did not resolve to a boolean.',
      context,
    });
  }
}

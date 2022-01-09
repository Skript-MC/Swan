import type { ArgumentContext, ArgumentResult } from '@sapphire/framework';
import { Argument } from '@sapphire/framework';
import CustomResolvers from '@/app/resolvers';
import type SwanCommand from '@/app/structures/commands/SwanCommand';

export default class CommandArgument extends Argument<SwanCommand> {
  public override run(parameter: string, context: ArgumentContext<SwanCommand>): ArgumentResult<SwanCommand> {
    const resolved = CustomResolvers.resolveCommand(parameter);

    if (resolved.success)
      return this.ok(resolved.value);
    return this.error({
      parameter,
      identifier: resolved.error,
      message: 'The argument did not resolve to a command.',
      context,
    });
  }
}

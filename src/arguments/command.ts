import type { ArgumentContext, ArgumentResult } from '@sapphire/framework';
import { Argument } from '@sapphire/framework';
import type SwanCommand from '@/app/structures/commands/SwanCommand';

export default class CommandArgument extends Argument<SwanCommand> {
  public override run(parameter: string, context: ArgumentContext<SwanCommand>): ArgumentResult<SwanCommand> {
    const command = context.command.container.stores.get('commands')
      .find(cmd => cmd.aliases.includes(parameter));

    return command
      ? this.ok(command as SwanCommand)
      : this.error({ parameter });
  }
}

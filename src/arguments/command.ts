import type { ArgumentContext, ArgumentResult } from '@sapphire/framework';
import { Argument } from '@sapphire/framework';
import type SwanCommand from '@/app/structures/commands/SwanCommand';
import type SwanCommandStore from '@/app/structures/commands/SwanCommandStore';

export default class CommandArgument extends Argument<SwanCommand> {
  public override run(arg: string, context: ArgumentContext<SwanCommand>): ArgumentResult<SwanCommand> {
    const command = (context.command.context.stores
      .get('commands') as SwanCommandStore)
      .find(cmd => cmd.aliases.includes(arg));

    return command
      ? this.ok(command)
      : this.error({ parameter: arg });
  }
}

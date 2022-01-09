import type { AsyncPreconditionResult, PreconditionContext } from '@sapphire/framework';
import { Identifiers, Precondition } from '@sapphire/framework';
import type { Message } from 'discord.js';
import type SwanCommand from '@/app/structures/commands/SwanCommand';

export interface RolePreconditionContext extends PreconditionContext {
  role: string;
}

export default class RolePrecondition extends Precondition {
  public override async run(
    message: Message,
    _command: SwanCommand,
    context: RolePreconditionContext,
  ): AsyncPreconditionResult {
    if (message.member?.roles.cache.has(context.role))
      return this.ok();

    return this.error({
      identifier: Identifiers.PreconditionRole,
      message: `User does not have required role: ${context.role}`,
      context: { role: context.role },
    });
  }
}

import type { AsyncPreconditionResult, PreconditionContext } from '@sapphire/framework';
import { Identifiers, Precondition } from '@sapphire/framework';
import type { Message } from 'discord.js';
import type SwanCommand from '@/app/structures/commands/SwanCommand';

export interface NotRoleContext extends PreconditionContext {
  role: string;
}

export default class NotRolePrecondition extends Precondition {
  public override async run(message: Message, _command: SwanCommand, context: NotRoleContext): AsyncPreconditionResult {
    if (!message.member?.roles.cache.has(context.role))
      return this.ok();

    return this.error({
      identifier: Identifiers.PreconditionNotRole,
      message: `User has forbidden role: ${context.role}`,
      context: { role: context.role },
    });
  }
}

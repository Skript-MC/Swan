import type { AsyncPreconditionResult, PreconditionContext } from '@sapphire/framework';
import { Identifiers, Precondition } from '@sapphire/framework';
import type { CommandInteraction } from 'discord.js';
import type { SwanInputCommand } from '@/app/types';

export interface NotRoleContext extends PreconditionContext {
  role: string;
}

export default class NotRolePrecondition extends Precondition {
  public override async chatInputRun(
    interaction: CommandInteraction,
    _command: SwanInputCommand,
    context: NotRoleContext,
  ): AsyncPreconditionResult {
    // TODO
    // if (!interaction.member?.roles.cache.has(context.role))
      return this.ok();

    return this.error({
      identifier: Identifiers.PreconditionNotRole,
      message: `User has forbidden role: ${context.role}`,
      context: { role: context.role },
    });
  }
}

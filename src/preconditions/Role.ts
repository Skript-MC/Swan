import type { AsyncPreconditionResult, PreconditionContext } from '@sapphire/framework';
import { Identifiers, Precondition } from '@sapphire/framework';
import type { CommandInteraction } from 'discord.js';
import type { SwanInputCommand } from '@/app/types';

export interface RolePreconditionContext extends PreconditionContext {
  role: string;
}

export default class RolePrecondition extends Precondition {
  public override async chatInputRun(
    interaction: CommandInteraction,
    command: SwanInputCommand,
    context: RolePreconditionContext,
  ): AsyncPreconditionResult {
    // TODO
    if (interaction.member)
      return this.ok();

    return this.error({
      identifier: Identifiers.PreconditionRole,
      message: `User does not have required role: ${context.role}`,
      context: { role: context.role },
    });
  }
}

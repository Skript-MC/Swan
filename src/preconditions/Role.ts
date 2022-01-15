import type { AsyncPreconditionResult, PreconditionContext } from '@sapphire/framework';
import { Identifiers, Precondition } from '@sapphire/framework';
import type { CommandInteraction } from 'discord.js';
import { ContextMenuInteraction, Interaction } from 'discord.js';
import type { SwanChatInputCommand, SwanContextMenuCommand } from '@/app/types';
import SwanCommand from '@/app/structures/commands/SwanCommand';

export interface RolePreconditionContext extends PreconditionContext {
  role: string;
}

export default class RolePrecondition extends Precondition {
  public override async contextMenuRun(
    interaction: ContextMenuInteraction,
    command: SwanContextMenuCommand,
    context: RolePreconditionContext,
  ): AsyncPreconditionResult {
    return this._check(interaction, command, context);
  }

  public override async chatInputRun(
    interaction: CommandInteraction,
    command: SwanChatInputCommand,
    context: RolePreconditionContext,
  ): AsyncPreconditionResult {
    return this._check(interaction, command, context);
  }

  private async _check(
    interaction: Interaction,
    command: SwanCommand,
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

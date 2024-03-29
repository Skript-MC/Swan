import type { AsyncPreconditionResult, PreconditionContext } from '@sapphire/framework';
import { Identifiers, Precondition } from '@sapphire/framework';
import { GuildMemberRoleManager } from 'discord.js';
import type { SwanCommand } from '@/app/structures/commands/SwanCommand';
import type { SwanChatInputCommand, SwanContextMenuCommand } from '@/app/types';

export interface RolePreconditionContext extends PreconditionContext {
  role: string;
}

export class RolePrecondition extends Precondition {
  public override async contextMenuRun(
    interaction: SwanCommand.ContextMenuInteraction,
    command: SwanContextMenuCommand,
    context: RolePreconditionContext,
  ): AsyncPreconditionResult {
    return this._check(interaction, command, context);
  }

  public override async chatInputRun(
    interaction: SwanCommand.ChatInputInteraction,
    command: SwanChatInputCommand,
    context: RolePreconditionContext,
  ): AsyncPreconditionResult {
    return this._check(interaction, command, context);
  }

  private async _check(
    interaction: SwanCommand.CommandInteraction,
    _command: SwanCommand,
    context: RolePreconditionContext,
  ): AsyncPreconditionResult {
    const { roles } = interaction.member;
    if (roles instanceof GuildMemberRoleManager && roles.cache.has(context.role))
      return this.ok();
    else if (Array.isArray(roles) && roles.includes(context.role))
      return this.ok();

    return this.error({
      identifier: Identifiers.PreconditionRole,
      message: `User does not have required role: ${context.role}`,
      context: { role: context.role },
    });
  }
}

import type { AsyncPreconditionResult, PreconditionContext } from '@sapphire/framework';
import { Identifiers, Precondition } from '@sapphire/framework';
import type { CommandInteraction, ContextMenuInteraction, Interaction } from 'discord.js';
import { GuildMemberManager } from 'discord.js';
import type SwanCommand from '@/app/structures/commands/SwanCommand';
import type { SwanChatInputCommand, SwanContextMenuCommand } from '@/app/types';

export interface NotRoleContext extends PreconditionContext {
  role: string;
}

export default class NotRolePrecondition extends Precondition {
  public override async contextMenuRun(
    interaction: ContextMenuInteraction,
    command: SwanContextMenuCommand,
    context: NotRoleContext,
  ): AsyncPreconditionResult {
    return this._check(interaction, command, context);
  }

  public override async chatInputRun(
    interaction: CommandInteraction,
    command: SwanChatInputCommand,
    context: NotRoleContext,
  ): AsyncPreconditionResult {
    return this._check(interaction, command, context);
  }

  private async _check(
      interaction: Interaction,
      _command: SwanCommand,
      context: NotRoleContext,
  ): AsyncPreconditionResult {
    return this.ok();
    // if (interaction.member?.roles instanceof GuildMemberManager && interaction.member?.roles.cache.has(context.role))
    //   return this.ok();
    // else if (interaction.member?.roles instanceof String && interaction.member?.roles.includes(context.role))
    //   return this.ok();

    return this.error({
      identifier: Identifiers.PreconditionNotRole,
      message: `User has forbidden role: ${context.role}`,
      context: { role: context.role },
    });
  }
}

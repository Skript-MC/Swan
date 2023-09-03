import type { PreconditionContext, PreconditionResult } from '@sapphire/framework';
import { Identifiers, Precondition } from '@sapphire/framework';
import { GuildMemberRoleManager } from 'discord.js';
import type { SwanCommand } from '@/app/structures/commands/SwanCommand';
import type { SwanChatInputCommand, SwanContextMenuCommand } from '@/app/types';
import { Rules } from '@/app/types';
import { channels } from '@/conf/settings';

export interface ChannelRulesPreconditionContext extends PreconditionContext {
  rules: number;
}

export class ChannelRulesPrecondition extends Precondition {
  public override contextMenuRun(
    interaction: SwanCommand.ContextMenuInteraction,
    command: SwanContextMenuCommand,
    context: ChannelRulesPreconditionContext,
  ): PreconditionResult {
    return this._check(interaction, command, context);
  }

  public override chatInputRun(
    interaction: SwanCommand.ChatInputInteraction,
    command: SwanChatInputCommand,
    context: ChannelRulesPreconditionContext,
  ): PreconditionResult {
    return this._check(interaction, command, context);
  }

  private _check(
    interaction: SwanCommand.CommandInteraction,
    _command: SwanCommand,
    context: ChannelRulesPreconditionContext,
  ): PreconditionResult {
    const { roles } = interaction.member;
    if (roles instanceof GuildMemberRoleManager && roles.cache.has(process.env.STAFF_ROLE))
      return this.ok();
    else if (Array.isArray(roles) && roles.includes(process.env.STAFF_ROLE))
      return this.ok();

    // If the command is forbidden in help channels.
    if (context.rules & Rules.NoHelpChannel && channels.help.includes(interaction.channel.id))
      return this.error({ identifier: Identifiers.PreconditionChannelRules, message: 'Command is forbidden in help channels' });

    // If the command has to be executed in the bot channel.
    if (context.rules & Rules.OnlyBotChannel && interaction.channel.id !== channels.bot)
      return this.error({ identifier: Identifiers.PreconditionChannelRules, message: 'Command has to be run in bot channel' });

    // If the command only works in the help channels.
    const isHelpOrBotChannel = channels.help.includes(interaction.channel.id)
      || interaction.channel.id === channels.bot;
    if (context.rules & Rules.OnlyHelpChannel && !isHelpOrBotChannel)
      return this.error({ identifier: Identifiers.PreconditionChannelRules, message: 'Command has to be run in help or bot channel' });

    return this.ok();
  }
}

import type { PreconditionContext, PreconditionResult } from '@sapphire/framework';
import { Identifiers, Precondition } from '@sapphire/framework';
import type { CommandInteraction } from 'discord.js';
import type { SwanInputCommand } from '@/app/types';
import { Rules } from '@/app/types';
import settings from '@/conf/settings';

export interface ChannelRulesPreconditionContext extends PreconditionContext {
  rules: number;
}

export default class ChannelRulesPrecondition extends Precondition {
  public override chatInputRun(
    interaction: CommandInteraction,
    _command: SwanInputCommand,
    context: ChannelRulesPreconditionContext,
  ): PreconditionResult {
    // If the command is forbidden in help channels.
    if (context.rules & Rules.NoHelpChannel && settings.channels.help.includes(interaction.channel.id))
      return this.error({ identifier: Identifiers.PreconditionChannelRules, message: 'Command is forbidden in help channels' });

    // If the command has to be executed in the bot channel.
    if (context.rules & Rules.OnlyBotChannel && interaction.channel.id !== settings.channels.bot)
      return this.error({ identifier: Identifiers.PreconditionChannelRules, message: 'Command has to be run in bot channel' });

    // If the command only works in the help channels.
    const isHelpOrBotChannel = settings.channels.help.includes(interaction.channel.id)
      || interaction.channel.id === settings.channels.bot;
    if (context.rules & Rules.OnlyHelpChannel && !isHelpOrBotChannel)
      return this.error({ identifier: Identifiers.PreconditionChannelRules, message: 'Command has to be run in help or bot channel' });

    return this.ok();
  }
}

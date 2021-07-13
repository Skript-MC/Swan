import type { PreconditionContext, PreconditionResult } from '@sapphire/framework';
import { Precondition } from '@sapphire/framework';
import type { Message } from 'discord.js';
import type SwanCommand from '@/app/structures/commands/SwanCommand';
import { Rules } from '@/app/types';
import settings from '@/conf/settings';

export interface ChannelRulesPreconditionContext extends PreconditionContext {
  rules: number;
}

export default class ChannelRulesPrecondition extends Precondition {
  public run(message: Message, _command: SwanCommand, context: ChannelRulesPreconditionContext): PreconditionResult {
    const identifier = 'preconditionRules';

    // If the command is forbidden in help channels.
    if (context.rules & Rules.NoHelpChannel && settings.channels.help.includes(message.channel.id))
      return this.error({ identifier, message: 'Command is forbidden in help channels' });

    // If the command has to be executed in the bot channel.
    if (context.rules & Rules.OnlyBotChannel && message.channel.id !== settings.channels.bot)
      return this.error({ identifier, message: 'Command has to be run in bot channel' });

    // If the command only works in the help channels.
    const isHelpOrBotChannel = settings.channels.help.includes(message.channel.id)
      || message.channel.id === settings.channels.bot;
    if (context.rules & Rules.OnlyHelpChannel && !isHelpOrBotChannel)
      return this.error({ identifier, message: 'Command has to be run in help or bot channel' });

    return this.ok();
  }
}

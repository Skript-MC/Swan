import { Inhibitor } from 'discord-akairo';
import type { Command } from 'discord-akairo';
import type { Message } from 'discord.js';
import { Rules } from '@/app/types';
import settings from '@/conf/settings';

class RulesInhibitor extends Inhibitor {
  constructor() {
    super('rules', {
      reason: 'rules',
    });
  }

  public exec(message: Message, command: Command): boolean {
    // Return true to block the command.

    // If the command is forbidden in help channels.
    if (command.rules?.includes(Rules.NoHelpChannel) && settings.channels.help.includes(message.channel.id))
      return true;

    // If the command has to be executed in the bot channel.
    if (command.rules?.includes(Rules.OnlyBotChannel) && message.channel.id !== settings.channels.bot)
      return true;

    // If the command only works in the help channels.
    if (command.rules?.includes(Rules.OnlyHelpChannel)
      && (!settings.channels.help.includes(message.channel.id)
        || message.channel.id !== settings.channels.bot))
      return true;

    return false;
  }
}

export default RulesInhibitor;

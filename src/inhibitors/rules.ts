import { Inhibitor } from 'discord-akairo';
import type { Command } from 'discord-akairo';
import type { Message } from 'discord.js';
import settings from '../../config/settings';
import { Rules } from '../types';

class RulesInhibitor extends Inhibitor {
  constructor() {
    super('rules', {
      reason: 'rules',
    });
  }

  public exec(message: Message, command: Command): boolean {
    // Return true to block the command

    // No help channels
    if (command.rules?.includes(Rules.NoHelpChannel) && settings.channels.help.includes(message.channel.id))
      return true;

    // Only bot channel
    if (command.rules?.includes(Rules.OnlyBotChannel) && message.channel.id !== settings.channels.bot)
      return true;

    // Only help channel
    if (command.rules?.includes(Rules.OnlyHelpChannel)
      && (!settings.channels.help.includes(message.channel.id)
        || message.channel.id !== settings.channels.bot))
      return true;

    return false;
  }
}

export default RulesInhibitor;

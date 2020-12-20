import { Inhibitor } from 'discord-akairo';
import settings from '../../config/settings';
import { constants } from '../utils';

class RulesInhibitor extends Inhibitor {
  constructor() {
    super('rules', {
      reason: 'rules',
    });
  }

  exec(message, command) {
    // Return true to block the command

    // No help channels
    if (command.rules?.includes(constants.RULES.NO_HELP_CHANNEL) && settings.channels.help.includes(message.channel.id))
      return true;

    // Only bot channel
    if (command.rules?.includes(constants.RULES.ONLY_BOT_CHANNEL) && message.channel.id !== settings.channels.bot)
      return true;

    // Only help channel
    if (command.rules?.includes(constants.RULES.ONLY_HELP_CHANNEL)
      && (!settings.channels.help.includes(message.channel.id)
        || message.channel.id !== settings.channels.bot))
      return true;

    return false;
  }
}

export default RulesInhibitor;

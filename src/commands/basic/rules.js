import Command from '../../components/Command';
import { discordError } from '../../components/Messages';
import { config } from '../../main';

class Rules extends Command {
  constructor() {
    super('Rules');
    this.regex = /(rule|r(e|è)gle)s?/gimu;
    this.usage = 'rule <règle>';
    this.examples.push('rule 2');
  }

  async execute(message, args) {
    if (message.channel.id !== config.channels.helpSkript || message.channel.id !== config.channels.helpSkript2 || message.channel.id !== config.channels.helpSkript3) return discordError(this.config.onlyInHelp, message);

    const rule = parseInt(args[0], 10);
    if (isNaN(rule) || rule < 1 || rule > this.config.messages.length) return discordError(this.config.invalidRule, message);
    return message.channel.send(this.config.messages[rule - 1]);
  }
}

export default Rules;

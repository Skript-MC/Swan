import Command from '../../components/Command';
import { discordError } from '../../components/Messages';
import { config } from '../../main';

class Rules extends Command {
  constructor() {
    super('Rules');
    this.aliases = ['rule', 'rules', 'règle', 'regle', 'règles', 'regles'];
    this.usage = 'rule <règle>';
    this.examples = ['rule 2'];
  }

  async execute(message, args) {
    if (!config.channels.helpSkript.includes(message.channel.id)) return message.channel.send(discordError(this.config.onlyInHelp, message));

    const rule = parseInt(args[0], 10);
    if (isNaN(rule) || rule < 1 || rule > this.config.messages.length) return message.channel.send(discordError(this.config.invalidRule, message));
    return message.channel.send(this.config.messages[rule - 1]);
  }
}

export default Rules;

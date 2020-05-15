import Command from '../../structures/Command';

class Rules extends Command {
  constructor() {
    super('Rules');
    this.aliases = ['rule', 'rules', 'règle', 'regle', 'règles', 'regles'];
    this.usage = 'rule <règle>';
    this.examples = ['rule 2'];
  }

  async execute(client, message, args) {
    if (!client.config.channels.helpSkript.includes(message.channel.id)) return message.channel.sendError(this.config.onlyInHelp, message.member);

    const rule = parseInt(args[0], 10);
    if (isNaN(rule) || rule < 1 || rule > this.config.messages.length) return message.channel.sendError(this.config.invalidRule, message.member);
    return message.channel.send(this.config.messages[rule - 1]);
  }
}

export default Rules;

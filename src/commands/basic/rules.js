import Command from '../../structures/Command';

class Rules extends Command {
  constructor() {
    super('Rules');
    this.aliases = ['rule', 'rules', 'règle', 'regle', 'règles', 'regles'];
    this.usage = 'rule <règle>';
    this.examples = ['rule 2'];
  }

  async execute(client, message, args) {
    if (!client.config.channels.helpSkript.includes(message.channel.id) || message.channel.id !== client.config.channels.bot) {
      return message.channel.sendError(this.config.onlyInHelp, message.member);
    }

    const rule = parseInt(args[0], 10);
    if (isNaN(rule) || rule < 1 || rule > this.config.messages.length) {
      const help = this.config.messages.map(msg => `\`${this.config.messages.indexOf(msg) + 1}\` : ${msg.slice(0, 50)}...`).join('\n');
      return message.channel.sendError(
        this.config.invalidRule.replace('%s', help),
        message.member,
      );
    }
    return message.channel.send(this.config.messages[rule - 1]);
  }
}

export default Rules;

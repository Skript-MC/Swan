import Command from '../../structures/Command';

class EightBall extends Command {
  constructor() {
    super('8ball');
    this.aliases = ['8ball'];
    this.usage = '8ball <question>';
    this.examples = ['8ball suis-je le plus beau ?'];
  }

  async execute(message, args) {
    if (args.length === 0) return message.channel.sendError(this.config.noQuestion, message.member);
    let answer;
    if (Math.random() < 0.5) {
      answer = this.config.affirmative[Math.floor(Math.random() * this.config.affirmative.length)];
    } else {
      answer = this.config.negative[Math.floor(Math.random() * this.config.negative.length)];
    }
    message.channel.send(answer);
  }
}

export default EightBall;

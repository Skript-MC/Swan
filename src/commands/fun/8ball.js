import Command from '../../structures/Command';
import { discordError } from '../../structures/messages';
import { MessageEmbed } from 'discord.js';
import { config } from '../../main';

class EightBall extends Command {
  constructor() {
    super('8ball');
    this.aliases = ['8ball'];
    this.usage = '8ball <question>';
    this.examples = ['8ball suis-je le plus beau ?'];
  }

  async execute(message, args) {
    if (args.length === 0) return message.channel.send(discordError(this.config.noQuestion, message));
    let answer;
    if (Math.random() < 0.5) {
      answer = this.config.affirmative[Math.floor(Math.random() * this.config.affirmative.length)];
    } else {
      answer = this.config.negative[Math.floor(Math.random() * this.config.negative.length)];
    }
    const embed = new MessageEmbed()
      .setColor(config.colors.default)
      .setAuthor(answer, message.author.avatarURL())
      .setFooter(`Exécuté par ${message.author.username}`)
      .setTimestamp();
    message.channel.send(embed);
  }
}

export default EightBall;

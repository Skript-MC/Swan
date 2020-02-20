import { MessageEmbed } from 'discord.js';
import Command from '../../helpers/Command';
import { config } from '../../main';

class Joke extends Command {
  constructor() {
    super('Joke');
    this.aliases = ['joke', 'blague', 'rire'];
    this.usage = 'joke';
    this.examples = ['joke'];
    this.enabledInHelpChannels = false;
  }

  async execute(message, _args) {
    const jokes = this.config.jokes;
    const random = jokes[Math.floor(Math.random() * jokes.length)];
    const split = random.split(';');
    const joke = this.config.message
      .replace('%j', split[0])
      .replace('%r', split[1]);
    const embed = new MessageEmbed()
      .setColor(config.colors.default)
      .setTimestamp()
      .setDescription(joke)
      .setFooter(`Exécuté par ${message.author.username}`);
    message.channel.send(embed);
  }
}

export default Joke;

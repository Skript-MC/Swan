import { MessageEmbed } from 'discord.js';
import Command from '../../structures/Command';
import { client, config } from '../../main';

class Ping extends Command {
  constructor() {
    super('Ping');
    this.aliases = ['ping', 'ms'];
    this.usage = 'ping';
    this.examples = ['ping'];
  }

  async execute(message, _args) {
    const msg = await message.channel.send(this.config.firstMessage);
    msg.delete();
    const description = this.config.secondMessage
      .replace('%s', msg.createdTimestamp - message.createdTimestamp)
      .replace('%x', Math.round(client.ws.ping));
    const embed = new MessageEmbed()
      .setColor(config.colors.default)
      .setDescription(description)
      .setFooter(`Exécuté par ${message.member.nickname || message.author.username}`)
      .setTimestamp();
    message.channel.send(embed);
  }
}

export default Ping;

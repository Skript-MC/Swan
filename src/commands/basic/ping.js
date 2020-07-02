import { MessageEmbed } from 'discord.js';
import Command from '../../structures/Command';

function getColorFromPing(ping) {
  if (ping > 600) return ':red_circle:';
  if (ping > 400) return ':orange_circle:';
  if (ping > 200) return ':yellow_circle:';
  return ':green_circle:';
}

class Ping extends Command {
  constructor() {
    super('Ping');
    this.aliases = ['ping', 'ms'];
    this.usage = 'ping';
    this.examples = ['ping'];
  }

  async execute(client, message, _args) {
    const msg = await message.channel.send(this.config.firstMessage);
    msg.delete();

    const description = this.config.secondMessage
      .replace('%s', msg.createdTimestamp - message.createdTimestamp)
      .replace('%i', getColorFromPing(msg.createdTimestamp - message.createdTimestamp))
      .replace('%x', Math.round(client.ws.ping))
      .replace('%j', getColorFromPing(Math.round(client.ws.ping)));

    const embed = new MessageEmbed()
      .setColor(client.config.colors.default)
      .setDescription(description)
      .setFooter(`Exécuté par ${message.member.displayName}`)
      .setTimestamp();
    message.channel.send(embed);
  }
}

export default Ping;

import { Command } from 'discord-akairo';
import { MessageEmbed } from 'discord.js';

class PingCommand extends Command {
  constructor() {
    super('ping', {
      aliases: ['ping', 'p'],
      clientPermissions: ['SEND_MESSAGES'],
      channel: 'guild',
    });
  }

  getColorFromPing(ping) {
    if (ping > 600) return ':red_circle:';
    if (ping > 400) return ':orange_circle:';
    if (ping > 200) return ':yellow_circle:';
    return ':green_circle:';
  }

  async exec(message) {
    const sent = await message.util.send(this.client.messages.ping.firstMessage);
    const timeDiff = (sent.editedAt || sent.createdAt) - (message.editedAt || message.createdAt);

    const description = this.client.messages.ping.secondMessage
      .replace('{SWAN_PING}', timeDiff)
      .replace('{SWAN_INDICATOR}', this.getColorFromPing(timeDiff))
      .replace('{DISCORD_PING}', Math.round(this.client.ws.ping))
      .replace('{DISCORD_INDICATOR}', this.getColorFromPing(Math.round(this.client.ws.ping)));

    const embed = new MessageEmbed()
      .setColor(this.client.settings.colors.default)
      .setDescription(description)
      .setFooter(`Exécuté par ${message.member.displayName}`)
      .setTimestamp();

    return message.util.send(embed);
  }
}

export default PingCommand;

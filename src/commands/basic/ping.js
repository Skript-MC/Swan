import { Command } from 'discord-akairo';
import { MessageEmbed } from 'discord.js';
import { ping as config } from '../../../config/commands/basic';
import settings from '../../../config/settings';

class PingCommand extends Command {
  constructor() {
    super('ping', {
      aliases: config.settings.aliases,
      description: { ...config.description },
      clientPermissions: config.settings.clientPermissons,
      userPermissions: config.settings.userPermissions,
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
    if (settings.channels.help.includes(message.channel.id))
      return;

    const sent = await message.util.send(config.messages.firstMessage);
    const timeDiff = (sent.editedAt || sent.createdAt) - (message.editedAt || message.createdAt);

    const description = config.messages.secondMessage
      .replace('{SWAN_PING}', timeDiff)
      .replace('{SWAN_INDICATOR}', this.getColorFromPing(timeDiff))
      .replace('{DISCORD_PING}', Math.round(this.client.ws.ping))
      .replace('{DISCORD_INDICATOR}', this.getColorFromPing(Math.round(this.client.ws.ping)));

    const embed = new MessageEmbed()
      .setColor(settings.colors.default)
      .setDescription(description)
      .setFooter(`Exécuté par ${message.member.displayName}`)
      .setTimestamp();

    return message.util.send(embed);
  }
}

export default PingCommand;

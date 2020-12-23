import { Command } from 'discord-akairo';
import { MessageEmbed } from 'discord.js';
import type { Message } from 'discord.js';
import { ping as config } from '../../../config/commands/basic';
import settings from '../../../config/settings';
import type { PingCommandArguments } from '../../types/CommandArguments';
import Rules from '../../types/rules';

class PingCommand extends Command {
  constructor() {
    super('ping', {
      aliases: config.settings.aliases,
      details: config.details,
      clientPermissions: config.settings.clientPermissions,
      userPermissions: config.settings.userPermissions,
      channel: 'guild',
    });
    this.rules = [Rules.OnlyBotChannel];
  }

  public async exec(message: Message, _args: PingCommandArguments): Promise<void> {
    const sent = await message.util.send(config.messages.firstMessage);
    const timeDiff = (sent.editedAt || sent.createdAt).getTime() - (message.editedAt || message.createdAt).getTime();

    const description = config.messages.secondMessage
      .replace('{SWAN_PING}', timeDiff.toString())
      .replace('{SWAN_INDICATOR}', this._getColorFromPing(timeDiff))
      .replace('{DISCORD_PING}', Math.round(this.client.ws.ping).toString())
      .replace('{DISCORD_INDICATOR}', this._getColorFromPing(Math.round(this.client.ws.ping)));

    const embed = new MessageEmbed()
      .setColor(settings.colors.default)
      .setDescription(description)
      .setFooter(`Exécuté par ${message.member.displayName}`)
      .setTimestamp();

    await message.util.send(embed);
  }

  private _getColorFromPing(ping: number): string {
    if (ping > 600)
      return ':red_circle:';
    if (ping > 400)
      return ':orange_circle:';
    if (ping > 200)
      return ':yellow_circle:';
    return ':green_circle:';
  }
}

export default PingCommand;

import { Command } from 'discord-akairo';
import { MessageEmbed } from 'discord.js';
import pupa from 'pupa';
import { ping as config } from '../../../config/commands/basic';
import settings from '../../../config/settings';
import { Rules } from '../../types';
import type { GuildMessage } from '../../types';
import type { PingCommandArguments } from '../../types/CommandArguments';

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

  public async exec(message: GuildMessage, _args: PingCommandArguments): Promise<void> {
    const sent = await message.util.send(config.messages.firstMessage);
    const swanPing = (sent.editedAt || sent.createdAt).getTime() - (message.editedAt || message.createdAt).getTime();
    const discordPing = Math.round(this.client.ws.ping);

    const description = pupa(config.messages.secondMessage, {
      swanPing,
      discordPing,
      swanIndicator: this._getColorFromPing(swanPing),
      discordIndicator: this._getColorFromPing(discordPing),
    });

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

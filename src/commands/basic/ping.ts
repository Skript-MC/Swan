import { ApplyOptions } from '@sapphire/decorators';
import { MessageEmbed } from 'discord.js';
import pupa from 'pupa';
import SwanCommand from '@/app/structures/commands/SwanCommand';
import type { GuildMessage, SwanCommandOptions } from '@/app/types';
import type { PingCommandArguments } from '@/app/types/CommandArguments';
import { noop } from '@/app/utils';
import { ping as config } from '@/conf/commands/basic';
import messages from '@/conf/messages';
import settings from '@/conf/settings';

@ApplyOptions<SwanCommandOptions>({ ...settings.globalCommandsOptions, ...config.settings })
export default class PingCommand extends SwanCommand {
  public override async messageRun(message: GuildMessage, _args: PingCommandArguments): Promise<void> {
    const sent = await message.channel.send(config.messages.firstMessage);
    const swanPing = (sent.editedAt ?? sent.createdAt).getTime() - (message.editedAt ?? message.createdAt).getTime();
    const discordPing = Math.round(this.container.client.ws.ping);

    const description = pupa(config.messages.secondMessage, {
      swanPing,
      discordPing,
      swanIndicator: this._getColorFromPing(swanPing),
      discordIndicator: this._getColorFromPing(discordPing),
    });

    const embed = new MessageEmbed()
      .setColor(settings.colors.default)
      .setDescription(description)
      .setFooter(pupa(messages.global.executedBy, { member: message.member }))
      .setTimestamp();

    await sent.delete().catch(noop);
    await message.channel.send({ embeds: [embed] });
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

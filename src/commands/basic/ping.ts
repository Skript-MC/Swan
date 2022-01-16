import type { ChatInputCommand } from '@sapphire/framework';
import type { CommandInteraction } from 'discord.js';
import { Message, MessageEmbed } from 'discord.js';
import pupa from 'pupa';
import ApplySwanOptions from '@/app/decorators/swanOptions';
import SwanCommand from '@/app/structures/commands/SwanCommand';
import { ping as config } from '@/conf/commands/basic';
import messages from '@/conf/messages';
import settings from '@/conf/settings';

@ApplySwanOptions(config)
export default class PingCommand extends SwanCommand {
  public override async chatInputRun(
    interaction: CommandInteraction,
    _context: ChatInputCommand.RunContext,
  ): Promise<void> {
    await this._exec(interaction);
  }

  private async _exec(interaction: CommandInteraction): Promise<void> {
    const defer = await interaction.deferReply({ fetchReply: true });
    if (!(defer instanceof Message))
      return;
    const swanPing = (defer.editedAt ?? defer.createdAt).getTime() - (interaction.createdAt).getTime();
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
      .setFooter({ text: pupa(messages.global.executedBy, { member: interaction.member }) })
      .setTimestamp();

    await interaction.followUp({ embeds: [embed] });
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

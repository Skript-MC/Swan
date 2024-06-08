import { ApplyOptions } from '@sapphire/decorators';
import type { ChatInputCommand } from '@sapphire/framework';
import type { ApplicationCommandOptionData } from 'discord.js';
import { ApplicationCommandType, EmbedBuilder } from 'discord.js';
import pupa from 'pupa';
import { ping as config } from '#config/commands/basic';
import { colors } from '#config/settings';
import { SwanCommand } from '#structures/commands/SwanCommand';

@ApplyOptions<SwanCommand.Options>(config.settings)
export class PingCommand extends SwanCommand {
  override canRunInDM = true;
  commandType = ApplicationCommandType.ChatInput;
  commandOptions: ApplicationCommandOptionData[] = [];

  public override async chatInputRun(
    interaction: SwanCommand.ChatInputInteraction,
    _context: ChatInputCommand.RunContext,
  ): Promise<void> {
    await this._exec(interaction);
  }

  private async _exec(interaction: SwanCommand.ChatInputInteraction): Promise<void> {
    const defer = await interaction.deferReply({ fetchReply: true });
    const swanPing = (defer.editedAt ?? defer.createdAt).getTime() - interaction.createdAt.getTime();
    const discordPing = Math.round(this.container.client.ws.ping);

    const description = pupa(config.messages.secondMessage, {
      swanPing,
      discordPing,
      swanIndicator: this._getColorFromPing(swanPing),
      discordIndicator: this._getColorFromPing(discordPing),
    });

    const embed = new EmbedBuilder().setColor(colors.default).setDescription(description).setTimestamp();

    await interaction.followUp({ embeds: [embed] });
  }

  private _getColorFromPing(ping: number): string {
    if (ping > 600) return ':red_circle:';
    if (ping > 400) return ':orange_circle:';
    if (ping > 200) return ':yellow_circle:';
    return ':green_circle:';
  }
}

import { isIP } from 'node:net';
import { ApplyOptions } from '@sapphire/decorators';
import type { ChatInputCommand } from '@sapphire/framework';
import axios from 'axios';
import type { ApplicationCommandOptionData } from 'discord.js';
import { ApplicationCommandOptionType, ApplicationCommandType, EmbedBuilder } from 'discord.js';
import pupa from 'pupa';
import { serverInfo as config } from '#config/commands/info';
import { apis, colors } from '#config/settings';
import { SwanCommand } from '#structures/commands/SwanCommand';
import type { ServerStatResponse } from '#types/index';
import { noop, nullop } from '#utils/index';

@ApplyOptions<SwanCommand.Options>(config.settings)
export class ServerInfoCommand extends SwanCommand {
  override canRunInDM = true;
  commandType = ApplicationCommandType.ChatInput;
  commandOptions: ApplicationCommandOptionData[] = [
    {
      type: ApplicationCommandOptionType.String,
      name: 'adresse',
      description: 'Adresse du serveur dont vous souhaitez avoir des informations',
      required: true,
    },
  ];

  public override async chatInputRun(
    interaction: SwanCommand.ChatInputInteraction,
    _context: ChatInputCommand.RunContext,
  ): Promise<void> {
    await this._exec(interaction, interaction.options.getString('adresse', true));
  }

  private async _exec(interaction: SwanCommand.ChatInputInteraction, query: string): Promise<void> {
    if (isIP(query.split(':').shift()!)) {
      await interaction.reply(config.messages.noIp).catch(noop);
      return;
    }

    const server: ServerStatResponse = await axios(`${apis.server}/2/${query}`)
      .then(res => (res.status >= 300 ? null : res.data))
      .catch(nullop);

    if (!server) {
      await interaction.reply(config.messages.requestFailed).catch(noop);
      return;
    }

    const embedMessages = config.messages.embed;
    const embed = new EmbedBuilder()
      .setColor(colors.default)
      .setAuthor({ name: pupa(embedMessages.title, { query }) })
      .setFooter({ text: embedMessages.footer })
      .setThumbnail(`${apis.server}/icon/${query}`)
      .setTimestamp();

    if (typeof server.online !== 'undefined') {
      embed.addFields({
        name: embedMessages.status,
        value: (server.online ? embedMessages.online : embedMessages.offline),
        inline: true,
      });
    }
    if (server.ip)
      embed.addFields({ name: embedMessages.ip, value: `\`${server.ip}${server.port ? `:${server.port}` : ''}\``, inline: true });
    if (server.players?.online && server.players?.max)
      embed.addFields({ name: embedMessages.players, value: `${server.players.online}/${server.players.max}`, inline: true });
    if (server.version)
      embed.addFields({ name: embedMessages.version, value: server.version, inline: true });
    if (server.hostname)
      embed.addFields({ name: embedMessages.hostname, value: server.hostname, inline: true });
    if (server.software)
      embed.addFields({ name: embedMessages.software, value: server.software, inline: true });
    if (server.plugins?.names)
      embed.addFields({ name: embedMessages.plugins, value: server.plugins.names.length.toString(), inline: true });
    if (server.mods?.names)
      embed.addFields({ name: embedMessages.mods, value: server.mods.names.length.toString(), inline: true });

    await interaction.reply({ embeds: [embed] });
  }
}

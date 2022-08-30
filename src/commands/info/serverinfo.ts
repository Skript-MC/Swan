import { isIP } from 'node:net';
import type { ChatInputCommand } from '@sapphire/framework';
import axios from 'axios';
import type { ApplicationCommandOptionData, CommandInteraction } from 'discord.js';
import { MessageEmbed } from 'discord.js';
import { ApplicationCommandOptionTypes } from 'discord.js/typings/enums';
import pupa from 'pupa';
import ApplySwanOptions from '@/app/decorators/swanOptions';
import SwanCommand from '@/app/structures/commands/SwanCommand';
import type { ServerStatResponse } from '@/app/types';
import { noop, nullop } from '@/app/utils';
import { serverInfo as config } from '@/conf/commands/info';
import settings from '@/conf/settings';

@ApplySwanOptions(config)
export default class ServerInfoCommand extends SwanCommand {
  public static commandOptions: ApplicationCommandOptionData[] = [
    {
      type: ApplicationCommandOptionTypes.STRING,
      name: 'adresse',
      description: 'Adresse du serveur dont vous souhaitez avoir des informations',
      required: true,
    },
  ];

  public override async chatInputRun(
    interaction: CommandInteraction,
    _context: ChatInputCommand.RunContext,
  ): Promise<void> {
    await this._exec(interaction, interaction.options.getString('adresse'));
  }

  private async _exec(interaction: CommandInteraction, query: string): Promise<void> {
    if (isIP(query.split(':').shift())) {
      await interaction.reply(config.messages.noIp).catch(noop);
      return;
    }

    const server: ServerStatResponse = await axios(`${settings.apis.server}/2/${query}`)
      .then(res => (res.status >= 300 ? null : res.data))
      .catch(nullop);

    if (!server) {
      await interaction.reply(config.messages.requestFailed).catch(noop);
      return;
    }

    const embedMessages = config.messages.embed;
    const embed = new MessageEmbed()
      .setColor(settings.colors.default)
      .setAuthor({ name: pupa(embedMessages.title, { query }) })
      .setFooter({ text: pupa(embedMessages.footer, { member: interaction.member }) })
      .setThumbnail(`${settings.apis.server}/icon/${query}`)
      .setTimestamp();

    if (typeof server.online !== 'undefined')
      embed.addField(embedMessages.status, (server.online ? embedMessages.online : embedMessages.offline), true);
    if (server.ip)
      embed.addField(embedMessages.ip, `\`${server.ip}${server.port ? `:${server.port}` : ''}\``, true);
    if (server.players?.online && server.players?.max)
      embed.addField(embedMessages.players, `${server.players.online}/${server.players.max}`, true);
    if (server.version)
      embed.addField(embedMessages.version, server.version, true);
    if (server.hostname)
      embed.addField(embedMessages.hostname, server.hostname, true);
    if (server.software)
      embed.addField(embedMessages.software, server.software, true);
    if (server.plugins?.names)
      embed.addField(embedMessages.plugins, server.plugins.names.length.toString(), true);
    if (server.mods?.names)
      embed.addField(embedMessages.mods, server.mods.names.length.toString(), true);

    await interaction.reply({ embeds: [embed] });
  }
}

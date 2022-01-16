import { ApplyOptions } from '@sapphire/decorators';
import type { Args } from '@sapphire/framework';
import axios from 'axios';
import { MessageEmbed } from 'discord.js';
import pupa from 'pupa';
import SwanCommand from '@/app/structures/commands/SwanCommand';
import type { GuildMessage, ServerStatResponse, SwanCommandOptions } from '@/app/types';
import { noop, nullop } from '@/app/utils';
import { serverInfo as config } from '@/conf/commands/info';
import messages from '@/conf/messages';
import settings from '@/conf/settings';

@ApplyOptions<SwanCommandOptions>({ ...settings.globalCommandsOptions, ...config.settings })
export default class ServerInfoCommand extends SwanCommand {
  public override async messageRun(message: GuildMessage, args: Args): Promise<void> {
    const query = await args.restResult('string');
    if (!query.success) {
      await message.channel.send(messages.prompt.serverAdress);
      return;
    }

    await this._exec(message, query.value);
  }

  private async _exec(message: GuildMessage, query: string): Promise<void> {
    const server: ServerStatResponse = await axios(settings.apis.server + query)
      .then(res => (res.status >= 300 ? null : res.data))
      .catch(nullop);

    if (!server) {
      message.channel.send(config.messages.requestFailed).catch(noop);
      return;
    }

    const embedMessages = config.messages.embed;
    const embed = new MessageEmbed()
      .setColor(settings.colors.default)
      .setAuthor({ name: pupa(embedMessages.title, { query }) })
      .setFooter({ text: pupa(embedMessages.footer, { member: message.member }) })
      .setTimestamp();

    if (typeof server.online !== 'undefined')
      embed.addField(embedMessages.status, (server.online ? embedMessages.online : embedMessages.offline), true);
    if (server.ip)
      embed.addField(embedMessages.ip, `\`${server.ip}${server.port ? `:${server.port}` : ''}\``, true);
    if (server.players)
      embed.addField(embedMessages.players, `${server.players.online}/${server.players.max}`, true);
    if (server.version)
      embed.addField(embedMessages.version, server.version, true);
    if (server.hostname)
      embed.addField(embedMessages.hostname, server.hostname, true);
    if (server.software)
      embed.addField(embedMessages.software, server.software, true);
    if (server.plugins)
      embed.addField(embedMessages.plugins, server.plugins.raw.length.toString(), true);
    if (server.mods)
      embed.addField(embedMessages.mods, server.mods.raw.length.toString(), true);

    await message.channel.send({ embeds: [embed] });
  }
}

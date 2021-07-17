import { ApplyOptions } from '@sapphire/decorators';
import type { Args } from '@sapphire/framework';
import axios from 'axios';
import { MessageEmbed } from 'discord.js';
import pupa from 'pupa';
import SwanCommand from '@/app/structures/commands/SwanCommand';
import type { GuildMessage, ServerStatResponse, SwanCommandOptions } from '@/app/types';
import { noop, nullop } from '@/app/utils';
import { serverInfo as config } from '@/conf/commands/info';
import settings from '@/conf/settings';

@ApplyOptions<SwanCommandOptions>({ ...settings.globalCommandsOptions, ...config.settings })
export default class ServerInfoCommand extends SwanCommand {
  // [{
  //   id: 'server',
  //   type: 'string',
  //   match: 'content',
  //   prompt: {
  //     start: config.messages.startPrompt,
  //     retry: config.messages.retryPrompt,
  //   },
  // }],

  public async run(message: GuildMessage, args: Args): Promise<void> {
    const serverQuery = await args.restResult('string');
    if (serverQuery.error)
      return void await message.channel.send(config.messages.retryPrompt);

    const server: ServerStatResponse = await axios(settings.apis.server + serverQuery.value)
      .then(response => (response.status >= 300 ? null : response.data))
      .catch(nullop);

    if (!server) {
      message.channel.send(config.messages.requestFailed).catch(noop);
      return;
    }

    const embedMessages = config.messages.embed;
    const embed = new MessageEmbed()
      .setColor(settings.colors.default)
      .setAuthor(pupa(embedMessages.title, { query: serverQuery.value }))
      .setFooter(pupa(embedMessages.footer, { member: message.member }))
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
      embed.addField(embedMessages.plugins, server.plugins.raw.length, true);
    if (server.mods)
      embed.addField(embedMessages.mods, server.mods.raw.length, true);

    await message.channel.send(embed);
  }
}

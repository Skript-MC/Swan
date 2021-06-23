import axios from 'axios';
import { Command } from 'discord-akairo';
import { MessageEmbed } from 'discord.js';
import pupa from 'pupa';
import type { GuildMessage, ServerStatResponse } from '@/app/types';
import type { ServerInfoCommandArguments } from '@/app/types/CommandArguments';
import { noop } from '@/app/utils';
import { serverInfo as config } from '@/conf/commands/info';
import settings from '@/conf/settings';

class ServerInfoCommand extends Command {
  constructor() {
    super('serverInfo', {
      aliases: config.settings.aliases,
      details: config.details,
      args: [{
        id: 'server',
        type: 'string',
        match: 'content',
        prompt: {
          start: config.messages.startPrompt,
          retry: config.messages.retryPrompt,
        },
      }],
      clientPermissions: config.settings.clientPermissions,
      userPermissions: config.settings.userPermissions,
      channel: 'guild',
    });
  }

  public async exec(message: GuildMessage, args: ServerInfoCommandArguments): Promise<void> {
    let server: ServerStatResponse;
    try {
      server = await axios(settings.apis.server + args.server)
        .then(response => (response.status >= 300 ? null : response.data));
    } catch {
      message.channel.send(config.messages.requestFailed).catch(noop);
      return;
    }

    if (!server) {
      message.channel.send(config.messages.requestFailed).catch(noop);
      return;
    }

    const embedMessages = config.messages.embed;
    const embed = new MessageEmbed()
      .setColor(settings.colors.default)
      .setAuthor(pupa(embedMessages.title, { query: args.server }))
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

export default ServerInfoCommand;

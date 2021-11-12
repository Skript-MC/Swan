import { ApplyOptions } from '@sapphire/decorators';
import axios from 'axios';
import { MessageEmbed } from 'discord.js';
import pupa from 'pupa';
import Arguments from '@/app/decorators/Argument';
import SwanCommand from '@/app/structures/commands/SwanCommand';
import { GuildMessage } from '@/app/types';
import type { ServerStatResponse, SwanCommandOptions } from '@/app/types';
import { ServerInfoCommandArguments } from '@/app/types/CommandArguments';
import { noop, nullop } from '@/app/utils';
import { serverInfo as config } from '@/conf/commands/info';
import settings from '@/conf/settings';

@ApplyOptions<SwanCommandOptions>({ ...settings.globalCommandsOptions, ...config.settings })
export default class ServerInfoCommand extends SwanCommand {
  @Arguments({
    name: 'server',
    type: 'string',
    match: 'rest',
    required: true,
    message: config.messages.retryPrompt,
  })
  // @ts-expect-error ts(2416)
  public override async messageRun(message: GuildMessage, args: ServerInfoCommandArguments): Promise<void> {
    const server: ServerStatResponse = await axios(settings.apis.server + args.server)
      .then(response => (response.status >= 300 ? null : response.data))
      .catch(nullop);

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
      embed.addField(embedMessages.plugins, server.plugins.raw.length.toString(), true);
    if (server.mods)
      embed.addField(embedMessages.mods, server.mods.raw.length.toString(), true);

    await message.channel.send({ embeds: [embed] });
  }
}

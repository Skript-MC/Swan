import { Command } from 'discord-akairo';
import pupa from 'pupa';
import SwanChannel from '@/app/models/swanChannel';
import type { GuildMessage } from '@/app/types';
import type { LogsCommandArguments } from '@/app/types/CommandArguments';
import { noop } from '@/app/utils';
import { logs as config } from '@/conf/commands/admin';

class LogsCommand extends Command {
  constructor() {
    super('logs', {
      aliases: config.settings.aliases,
      details: config.details,
      clientPermissions: config.settings.clientPermissions,
      userPermissions: config.settings.userPermissions,
      channel: 'guild',
      args: [
        {
          id: 'channel',
          type: 'textChannel',
        },
        {
          id: 'logged',
          type: 'string',
        },
      ],
    });
  }

  public async exec(message: GuildMessage, args: LogsCommandArguments): Promise<void> {
    if (!args.channel) {
      void message.channel.send(config.messages.noChannelFound).catch(noop);
      return;
    }

    const swanChannel = await SwanChannel.findOne({ channelId: args.channel.id });
    if (!swanChannel) {
      void message.channel.send(config.messages.noChannelFound).catch(noop);
      return;
    }

    if (!args.logged) {
      void message.channel.send(pupa(config.messages.noStatus, { swanChannel })).catch(noop);
      return;
    }

    const logged = args.logged === 'on';

    await SwanChannel.findOneAndUpdate({ channelId: args.channel.id }, { logged });
    if (swanChannel.logged && !logged)
      this.client.cache.swanChannels.delete(swanChannel);
    else
      this.client.cache.swanChannels.add(swanChannel);


    void message.channel.send(pupa(config.messages.success, { status: logged ? 'activée' : 'désactivée' })).catch(noop);
  }
}

export default LogsCommand;

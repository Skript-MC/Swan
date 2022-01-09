import { ApplyOptions } from '@sapphire/decorators';
import pupa from 'pupa';
import Arguments from '@/app/decorators/Argument';
import SwanChannel from '@/app/models/swanChannel';
import SwanCommand from '@/app/structures/commands/SwanCommand';
import type { SwanCommandOptions } from '@/app/types';
import { GuildMessage } from '@/app/types';
import { LogsCommandArguments } from '@/app/types/CommandArguments';
import { noop } from '@/app/utils';
import { logs as config } from '@/conf/commands/admin';
import settings from '@/conf/settings';

@ApplyOptions<SwanCommandOptions>({ ...settings.globalCommandsOptions, ...config.settings })
export default class LogsCommand extends SwanCommand {
  @Arguments({
    name: 'channel',
    type: 'guildTextBasedChannel',
    match: 'pick',
  }, {
    name: 'logged',
    type: 'boolean',
    match: 'pick',
  })
  // @ts-expect-error ts(2416)
  public override async messageRun(message: GuildMessage, args: LogsCommandArguments): Promise<void> {
    // TODO(interactions): remove second argument, always show the current state for the given channel, and
    // add a toggle to enable/disable logging for the channel.
    const swanChannel = await SwanChannel.findOne({ channelId: args.channel.id });
    if (!swanChannel) {
      void message.channel.send(config.messages.noChannelFound).catch(noop);
      return;
    }

    await SwanChannel.findOneAndUpdate({ channelId: args.channel.id }, { logged: args.logged });
    if (swanChannel.logged && !args.logged)
      this.container.client.cache.swanChannels.delete(swanChannel);
    else
      this.container.client.cache.swanChannels.add(swanChannel);

    void message.channel.send(pupa(config.messages.success, { status: args.logged ? 'activée' : 'désactivée' })).catch(noop);
  }
}

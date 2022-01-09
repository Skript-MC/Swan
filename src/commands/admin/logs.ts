import { ApplyOptions } from '@sapphire/decorators';
import type { Args } from '@sapphire/framework';
import { isNullish } from '@sapphire/utilities';
import type { GuildTextBasedChannel } from 'discord.js';
import pupa from 'pupa';
import SwanChannel from '@/app/models/swanChannel';
import SwanCommand from '@/app/structures/commands/SwanCommand';
import type { GuildMessage, SwanCommandOptions } from '@/app/types';
import { noop } from '@/app/utils';
import { logs as config } from '@/conf/commands/admin';
import messages from '@/conf/messages';
import settings from '@/conf/settings';

@ApplyOptions<SwanCommandOptions>({ ...settings.globalCommandsOptions, ...config.settings })
export default class LogsCommand extends SwanCommand {
  public override async messageRun(message: GuildMessage, args: Args): Promise<void> {
    const channel = await args.pickResult('guildTextBasedChannel');
    if (!channel.success) {
      await message.channel.send(messages.prompt.channel);
      return;
    }

    const logged = await args.pickResult('boolean');

    await this._exec(message, channel.value, logged.value);
  }

  private async _exec(message: GuildMessage, channel: GuildTextBasedChannel, logged: boolean | null): Promise<void> {
    // TODO(interactions): remove second argument, always show the current state for the given channel, and
    // add a toggle to enable/disable logging for the channel.
    const swanChannel = await SwanChannel.findOne({ channelId: channel.id });
    if (!swanChannel) {
      void message.channel.send(config.messages.noChannelFound).catch(noop);
      return;
    }

    if (isNullish(logged)) {
      const result = await SwanChannel.findOne({ channelId: channel.id });
      void message.channel.send(
        pupa(config.messages.loggingStatus, { status: this._getStatus(result.logged) }),
      );
      return;
    }

    await SwanChannel.findOneAndUpdate({ channelId: channel.id }, { logged });
    if (swanChannel.logged && !logged)
      this.container.client.cache.swanChannels.delete(swanChannel);
    else
      this.container.client.cache.swanChannels.add(swanChannel);

    void message.channel.send(pupa(config.messages.success, { status: this._getStatus(logged) })).catch(noop);
  }

  private _getStatus(status: boolean): string {
    return status ? config.messages.on : config.messages.off;
  }
}

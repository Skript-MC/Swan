import { ApplyOptions } from '@sapphire/decorators';
import SwanChannel from '@/app/models/swanChannel';
import type { TaskOptions } from '@/app/structures/tasks/Task';
import Task from '@/app/structures/tasks/Task';
import { syncDatabaseChannels as config } from '@/conf/tasks/startup';

@ApplyOptions<TaskOptions>(config.settings)
export default class SyncDatabaseChannelsTask extends Task {
  public override async run(): Promise<void> {
    this.container.client.cache.swanChannels = new Set();
    for (const channel of this.container.client.guild.channels.cache.values()) {
      if (!channel.isText())
        continue;

      const swanChannel = await SwanChannel.findOneOrCreate({
        channelId: channel.id,
      }, {
        channelId: channel.id,
        logged: false,
      });
      this.container.client.cache.swanChannels.add(swanChannel);
    }
  }
}

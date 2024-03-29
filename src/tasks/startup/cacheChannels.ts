import { ApplyOptions } from '@sapphire/decorators';
import type { GuildTextBasedChannel } from 'discord.js';
import type { TaskOptions } from '@/app/structures/tasks/Task';
import { Task } from '@/app/structures/tasks/Task';
import type { ChannelArraySlugs, ChannelSingleSlug } from '@/app/types';
import { channels } from '@/conf/settings';

@ApplyOptions<TaskOptions>({ startupOrder: 6 })
export class CacheChannelsTask extends Task {
  public override run(): void {
    for (const [slug, channelIdOrIds] of Object.entries(channels)) {
      if (Array.isArray(channelIdOrIds)) {
        const validChannels = channelIdOrIds
          .map(id => this.container.client.guild.channels.cache.get(id))
          .filter(Boolean)
          .filter(channel => channel.isTextBased()) as GuildTextBasedChannel[];
        this.container.client.cache.channels[slug as ChannelArraySlugs] = validChannels;
      } else {
        const channel = this.container.client.guild.channels.cache.get(channelIdOrIds);
        this.container.client.cache.channels[slug as ChannelSingleSlug] = channel.isTextBased() ? channel : null;
      }
    }
  }
}

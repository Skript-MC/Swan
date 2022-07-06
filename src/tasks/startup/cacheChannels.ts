import { ApplyOptions } from '@sapphire/decorators';
import type { GuildTextBasedChannel } from 'discord.js';
import type { TaskOptions } from '@/app/structures/tasks/Task';
import Task from '@/app/structures/tasks/Task';
import type { ChannelArraySlugs, ChannelSingleSlug } from '@/app/types';
import settings from '@/conf/settings';
import { cacheChannels as config } from '@/conf/tasks/startup';

@ApplyOptions<TaskOptions>(config.settings)
export default class CacheChannelsTask extends Task {
  public override run(): void {
    for (const [slug, channelIdOrIds] of Object.entries(settings.channels)) {
      if (Array.isArray(channelIdOrIds)) {
        this.container.client.cache.channels[slug as ChannelArraySlugs] = channelIdOrIds
          .map(id => this.container.client.guild.channels.cache.get(id))
          .filter(Boolean)
          .filter(channel => channel.isText()) as GuildTextBasedChannel[];
      } else {
        const channel = this.container.client.guild.channels.cache.get(channelIdOrIds);
        this.container.client.cache.channels[slug as ChannelSingleSlug] = channel.isText() ? channel : null;
      }
    }
  }
}

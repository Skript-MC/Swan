import { Listener } from 'discord-akairo';
import { TextChannel } from 'discord.js';
import type { GuildChannel, GuildChannelResolvable } from 'discord.js';
import Logger from '@/app/structures/Logger';
import type { ChannelSlug } from '@/app/types';
import settings from '@/conf/settings';

class ReadyListener extends Listener {
  constructor() {
    super('ready', {
      event: 'ready',
      emitter: 'client',
    });
  }

  public exec(): void {
    this.client.guild = this.client.guilds.resolve(settings.bot.guild);

    if (!this.client.guild)
      throw new TypeError('Expected SwanClient.guild to be defined after resolving.');

    const resolveChannel = (chan: GuildChannelResolvable): GuildChannel => this.client.guild.channels.resolve(chan)!;
    const isText = (chan: GuildChannel): chan is TextChannel => chan instanceof TextChannel;

    type ChannelEntry = [channelSlug: ChannelSlug, resolvedChannel: GuildChannel | GuildChannel[]];

    // Resolve all channels entered in the config, to put them in client.cache.channels.<channel_name>.
    const entries: ChannelEntry[] = Object.entries(settings.channels)
      .map(([slug, ids]) => (Array.isArray(ids)
        ? [slug as ChannelSlug, ids.map(resolveChannel)]
        : [slug as ChannelSlug, resolveChannel(ids)]
      ));

    for (const [slug, channel] of entries) {
      if (Array.isArray(channel)) {
        if (channel.some(isText))
          this.client.cache.channels[slug] = channel.filter(isText);
      } else if (isText(channel)) {
        this.client.cache.channels[slug] = channel;
      }
    }

    this.client.checkValidity();

    Logger.success('Swan is ready to listen for messages.');

    this.client.isLoading = false;
  }
}

export default ReadyListener;

import { Listener } from 'discord-akairo';
import { TextChannel } from 'discord.js';
import type { GuildChannel, GuildChannelResolvable } from 'discord.js';
import Logger from '@/app/structures/Logger';
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
    const isText = (chan: GuildChannel): boolean => chan instanceof TextChannel;

    type ChannelEntry = [channelSlug: string, resolvedChannel: GuildChannel | GuildChannel[]];

    // Resolve all channels entered in the config, to put them in client.cachedChannels.<channel_name>.
    const entries: ChannelEntry[] = Object.entries(settings.channels)
      .map(([slug, ids]) => (Array.isArray(ids)
        ? [slug, ids.map(resolveChannel)]
        : [slug, resolveChannel(ids)]
      ));

    for (const [slug, channel] of entries) {
      if (Array.isArray(channel)) {
        if (channel.some(isText))
          this.client.cachedChannels[slug] = channel.filter((chan): chan is TextChannel => isText(chan));
      } else if (isText(channel)) {
        this.client.cachedChannels[slug] = channel;
      }
    }

    this.client.checkValidity();

    Logger.success('Swan is ready to listen for messages.');

    this.client.isLoading = false;
  }
}

export default ReadyListener;

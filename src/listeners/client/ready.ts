import { Listener } from 'discord-akairo';
import { TextChannel } from 'discord.js';
import type { GuildChannel, GuildChannelResolvable } from 'discord.js';
import Poll from '@/app/models/poll';
import reactionrole from '@/app/models/reactionRole';
import Logger from '@/app/structures/Logger';
import type { ChannelSlug } from '@/app/types';
import { noop, nullop } from '@/app/utils';
import settings from '@/conf/settings';

class ReadyListener extends Listener {
  constructor() {
    super('ready', {
      event: 'ready',
      emitter: 'client',
    });
  }

  public async exec(): Promise<void> {
    this.client.guild = this.client.guilds.resolve(settings.bot.guild);

    if (!this.client.guild)
      throw new TypeError('Expected SwanClient.guild to be defined after resolving.');

    const resolveChannel = (chan: GuildChannelResolvable): GuildChannel => this.client.guild.channels.resolve(chan)!;
    const isText = (chan: GuildChannel): chan is TextChannel => chan instanceof TextChannel;

    type ChannelEntry = [channelSlug: ChannelSlug, resolvedChannel: GuildChannel | GuildChannel[]];

    Logger.info('Caching channels...');
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

    // Cache polls' messages
    Logger.info('Caching polls...');
    const polls = await Poll.find();
    const cacheReactions = new Set([
      ...settings.miscellaneous.pollReactions.yesno,
      ...settings.miscellaneous.pollReactions.multiple,
    ]);

    for (const poll of polls) {
      const channel = this.client.channels.resolve(poll.channelId);
      if (!channel || !channel.isText()) {
        await Poll.findByIdAndRemove(poll._id);
        continue;
      }

      const message = await channel.messages.fetch(poll.messageId, true, true).catch(nullop);
      if (!message) {
        await Poll.findByIdAndRemove(poll._id);
        continue;
      }
      for (const reaction of message.reactions.cache.array()) {
        if (cacheReactions.has(reaction.emoji.name))
          await reaction.users.fetch().catch(noop);
      }
    }

    Logger.info('Caching reactions roles...');
    const reactionRoles = await reactionrole.find();
    for (const element of reactionRoles) {
      const channel = this.client.guild.channels.cache.get(element.channelId);
      const textChannel = channel as TextChannel;
      textChannel.messages.fetch(element.messageId)
        .then((message) => {
          this.client.cache.reactionRolesIds.push(message.id);
        })
        .catch(async () => {
          await reactionrole.findByIdAndDelete(element._id);
        });
    }

    this.client.checkValidity();

    Logger.success('Swan is ready to listen for messages.');

    this.client.isLoading = false;
  }
}

export default ReadyListener;

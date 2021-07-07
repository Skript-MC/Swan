import { Listener } from 'discord-akairo';
import { GuildAuditLogs, TextChannel } from 'discord.js';
import type { GuildChannel, GuildChannelResolvable } from 'discord.js';
import ConvictedUser from '@/app/models/convictedUser';
import Poll from '@/app/models/poll';
import ReactionRole from '@/app/models/reactionRole';
import ModerationData from '@/app/moderation/ModerationData';
import BanAction from '@/app/moderation/actions/BanAction';
import Logger from '@/app/structures/Logger';
import type { ChannelSlug, GuildBanAuditLogs } from '@/app/types';
import { SanctionTypes } from '@/app/types';
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
    this.client.guild = this.client.guilds.resolve(settings.bot.guild)!;

    if (!this.client.guild)
      throw new TypeError('Expected SwanClient.guild to be defined after resolving.');

    Logger.info('Caching channels...');
    this._cacheChannels();

    Logger.info('Caching polls...');
    await this._cachePolls();

    Logger.info('Caching reactions roles...');
    await this._cacheReactionRoles();

    Logger.info('Fetching missed bans...');
    await this._fetchMissingBans();

    this.client.checkValidity();

    Logger.success('Swan is ready to listen for messages.');

    this.client.isLoading = false;
  }

  private _cacheChannels(): void {
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
  }

  private async _cachePolls(): Promise<void> {
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
  }

  private async _cacheReactionRoles(): Promise<void> {
    const reactionRoles = await ReactionRole.find();
    for (const element of reactionRoles) {
      const channel = this.client.guild.channels.cache.get(element.channelId);
      const textChannel = channel as TextChannel;
      textChannel.messages.fetch(element.messageId)
        .then((message) => {
          this.client.cache.reactionRolesIds.add(message.id);
        })
        .catch(async () => {
          await ReactionRole.findByIdAndDelete(element._id);
        });
    }
  }

  private async _fetchMissingBans(): Promise<void> {
    const bans = await this.client.guild.fetchBans();
    const convictedUsers = await ConvictedUser.find();
    for (const ban of bans.values()) {
      if (!convictedUsers.some(usr => usr.memberId === ban.user.id)) {
        const logs = await this.client.guild.fetchAuditLogs({
          type: GuildAuditLogs.Actions.MEMBER_BAN_ADD,
        }) as GuildBanAuditLogs;

        const discordBan = logs.entries.find(entry => entry.target.id === ban.user.id);
        if (!discordBan)
          continue;

        const moderator = this.client.guild.members.resolve(discordBan.executor)
          ?? await this.client.guild.members.fetch(discordBan.executor).catch(nullop);
        if (!moderator)
          continue;

        const data = new ModerationData(this.client)
          .setVictim(ban.user, false)
          .setReason(ban.reason)
          .setModerator(moderator)
          .setDuration(-1, false)
          .setType(SanctionTypes.Hardban);
        try {
          await new BanAction(data).commit();
        } catch (unknownError: unknown) {
          Logger.error('An unexpected error occurred while banning a member!');
          Logger.detail(`Member ID: ${ban.user.id}`);
          Logger.detail(`Discord Ban Found: ${Boolean(discordBan)}`);
          Logger.detail((unknownError as Error).stack, true);
        }
      }
    }
  }
}

export default ReadyListener;

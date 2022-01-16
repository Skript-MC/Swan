import { Listener } from '@sapphire/framework';
import { GuildAuditLogs } from 'discord.js';
import type { GuildTextBasedChannel } from 'discord.js';
import ConvictedUser from '@/app/models/convictedUser';
import Poll from '@/app/models/poll';
import ReactionRole from '@/app/models/reactionRole';
import SwanChannel from '@/app/models/swanChannel';
import ModerationData from '@/app/moderation/ModerationData';
import BanAction from '@/app/moderation/actions/BanAction';
import type { ChannelArraySlugs, ChannelSingleSlug } from '@/app/types';
import { SanctionTypes } from '@/app/types';
import { noop, nullop } from '@/app/utils';
import settings from '@/conf/settings';

export default class ReadyListener extends Listener {
  public override async run(): Promise<void> {
    this.container.client.guild = this.container.client.guilds.resolve(settings.bot.guild)!;

    if (!this.container.client.guild)
      throw new TypeError('Expected SwanClient.guild to be defined after resolving.');

    this.container.logger.info('Caching channels...');
    this._cacheChannels();

    this.container.logger.info('Caching polls...');
    await this._cachePolls();

    this.container.logger.info('Caching reactions roles...');
    await this._cacheReactionRoles();

    this.container.logger.info('Fetching missed bans...');
    await this._fetchMissingBans();

    this.container.logger.info('Syncing database channels...');
    await this._syncDatabaseChannels();

    this.container.client.checkValidity();

    this.container.logger.info('Swan is ready to listen for messages.');

    this.container.client.isLoading = false;
  }

  private async _syncDatabaseChannels(): Promise<void> {
    this.container.client.cache.swanChannels = new Set();
    for (const channel of this.container.client.guild.channels.cache.values()) {
      if (!channel.isText())
        continue;
      const swanChannel = await SwanChannel.findOneOrCreate({
        channelId: channel.id,
      }, {
        channelId: channel.id,
        categoryId: channel.parentId,
        name: channel.name,
        logged: false,
      });
      this.container.client.cache.swanChannels.add(swanChannel);
    }
  }

  private _cacheChannels(): void {
    for (const [slug, channelIdOrIds] of Object.entries(settings.channels)) {
      if (Array.isArray(channelIdOrIds)) {
        const channels = channelIdOrIds
          .map(id => this.container.client.guild.channels.cache.get(id))
          .filter(Boolean)
          .filter(channel => channel.isText()) as GuildTextBasedChannel[];
        this.container.client.cache.channels[slug as ChannelArraySlugs] = channels;
      } else {
        const channel = this.container.client.guild.channels.cache.get(channelIdOrIds);
        this.container.client.cache.channels[slug as ChannelSingleSlug] = channel.isText() ? channel : null;
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
      const channel = this.container.client.channels.resolve(poll.channelId);
      if (!channel || !channel.isText()) {
        await Poll.findByIdAndRemove(poll._id);
        continue;
      }

      const message = await channel.messages.fetch(poll.messageId, { cache: true, force: true }).catch(nullop);
      if (!message) {
        await Poll.findByIdAndRemove(poll._id);
        continue;
      }
      for (const reaction of message.reactions.cache.values()) {
        if (cacheReactions.has(reaction.emoji.name))
          await reaction.users.fetch().catch(noop);
      }
    }
  }

  private async _cacheReactionRoles(): Promise<void> {
    const reactionRoles = await ReactionRole.find();
    for (const element of reactionRoles) {
      const channel = this.container.client.guild.channels.cache.get(element.channelId);
      if (!channel || !channel.isText())
        continue;
      channel.messages.fetch(element.messageId)
        .then((message) => {
          this.container.client.cache.reactionRolesIds.add(message.id);
        })
        .catch(async () => {
          await ReactionRole.findByIdAndDelete(element._id);
        });
    }
  }

  private async _fetchMissingBans(): Promise<void> {
    const bans = await this.container.client.guild.bans.fetch();
    const convictedUsers = await ConvictedUser.find();
    for (const ban of bans.values()) {
      if (!convictedUsers.some(usr => usr.memberId === ban.user.id)) {
        const logs = await this.container.client.guild.fetchAuditLogs({
          type: GuildAuditLogs.Actions.MEMBER_BAN_ADD,
        });

        const discordBan = logs.entries.find(entry => entry.target.id === ban.user.id);
        if (!discordBan)
          continue;

        const moderator = this.container.client.guild.members.resolve(discordBan.executor)
          ?? await this.container.client.guild.members.fetch(discordBan.executor).catch(nullop);
        if (!moderator)
          continue;

        const data = new ModerationData()
          .setVictim(ban.user, false)
          .setReason(ban.reason)
          .setModerator(moderator)
          .setDuration(-1, false)
          .setType(SanctionTypes.Hardban);
        try {
          await new BanAction(data).commit();
        } catch (unknownError: unknown) {
          this.container.logger.error('An unexpected error occurred while banning a member!');
          this.container.logger.info(`Member ID: ${ban.user.id}`);
          this.container.logger.info(`Discord Ban Found: ${Boolean(discordBan)}`);
          this.container.logger.info((unknownError as Error).stack, true);
        }
      }
    }
  }
}

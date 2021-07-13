import { ApplyOptions } from '@sapphire/decorators';
import type { EventOptions } from '@sapphire/framework';
import { Event } from '@sapphire/framework';
import { GuildAuditLogs, TextChannel } from 'discord.js';
import type { GuildChannel, GuildChannelResolvable } from 'discord.js';
import ConvictedUser from '@/app/models/convictedUser';
import Poll from '@/app/models/poll';
import ReactionRole from '@/app/models/reactionRole';
import ModerationData from '@/app/moderation/ModerationData';
import BanAction from '@/app/moderation/actions/BanAction';
import type { ChannelSlug, GuildBanAuditLogs } from '@/app/types';
import { SanctionTypes } from '@/app/types';
import { noop, nullop } from '@/app/utils';
import settings from '@/conf/settings';

@ApplyOptions<EventOptions>({ once: true })
export default class ReadyEvent extends Event {
  public async run(): Promise<void> {
    this.context.client.guild = this.context.client.guilds.resolve(settings.bot.guild)!;

    if (!this.context.client.guild)
      throw new TypeError('Expected SwanClient.guild to be defined after resolving.');

    this.context.logger.info('Caching channels...');
    this._cacheChannels();

    this.context.logger.info('Caching polls...');
    await this._cachePolls();

    this.context.logger.info('Caching reactions roles...');
    await this._cacheReactionRoles();

    this.context.logger.info('Fetching missed bans...');
    await this._fetchMissingBans();

    this.context.client.checkValidity();

    this.context.logger.info('Swan is ready to listen for messages.');

    this.context.client.isLoading = false;
  }

  private _cacheChannels(): void {
    const resolveChannel = (chan: GuildChannelResolvable): GuildChannel =>
      this.context.client.guild.channels.resolve(chan)!;
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
          this.context.client.cache.channels[slug] = channel.filter(isText);
      } else if (isText(channel)) {
        this.context.client.cache.channels[slug] = channel;
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
      const channel = this.context.client.channels.resolve(poll.channelId);
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
      const channel = this.context.client.guild.channels.cache.get(element.channelId);
      const textChannel = channel as TextChannel;
      textChannel.messages.fetch(element.messageId)
        .then((message) => {
          this.context.client.cache.reactionRolesIds.add(message.id);
        })
        .catch(async () => {
          await ReactionRole.findByIdAndDelete(element._id);
        });
    }
  }

  private async _fetchMissingBans(): Promise<void> {
    const bans = await this.context.client.guild.fetchBans();
    const convictedUsers = await ConvictedUser.find();
    for (const ban of bans.values()) {
      if (!convictedUsers.some(usr => usr.memberId === ban.user.id)) {
        const logs = await this.context.client.guild.fetchAuditLogs({
          type: GuildAuditLogs.Actions.MEMBER_BAN_ADD,
        }) as GuildBanAuditLogs;

        const discordBan = logs.entries.find(entry => entry.target.id === ban.user.id);
        if (!discordBan)
          continue;

        const moderator = this.context.client.guild.members.resolve(discordBan.executor)
          ?? await this.context.client.guild.members.fetch(discordBan.executor).catch(nullop);
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
          this.context.logger.error('An unexpected error occurred while banning a member!');
          this.context.logger.info(`Member ID: ${ban.user.id}`);
          this.context.logger.info(`Discord Ban Found: ${Boolean(discordBan)}`);
          this.context.logger.info((unknownError as Error).stack, true);
        }
      }
    }
  }
}

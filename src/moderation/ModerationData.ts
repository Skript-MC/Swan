import type { SapphireClient } from '@sapphire/framework';
import { container } from '@sapphire/pieces';
import type {
  Guild,
  GuildMember,
  GuildTextBasedChannel,
  User,
} from 'discord.js';
import {
  ChatInputCommandInteraction,
  Message,
  ModalSubmitInteraction,
  TextChannel, ThreadChannel,
} from 'discord.js';
import { nanoid } from 'nanoid';
import type {
  GuildMessage,
  ModerationDataResult,
  PersonInformations,
} from '@/app/types';
import { SanctionTypes } from '@/app/types';
import { getPersonFromCache } from '@/app/utils';
import * as configs from '@/conf/commands/moderation';
import messages from '@/conf/messages';

export default class ModerationData {
  moderatorId: string;
  guild: Guild;
  client: SapphireClient;
  channel: GuildTextBasedChannel;
  type?: SanctionTypes;
  config?: Record<string, string>;
  victim: PersonInformations;
  reason: string;
  duration?: number | null;
  finish?: number | null;
  start: number;
  privateChannel?: TextChannel;
  sanctionId: string;

  /**
   * Create moderation data from a message or from individual informations.
   *
   * @param {Message | TextChannel} argument
   * * If the argument is of type Message, then it is used to get all the data (moderator, guild, client, channel...).
   * * If the argument is a TextChannel, then the channel is used to get all the data.
   * * If the argument is a AkairoClient, then the channel is set to the log channel and it is used to get all the data.
   */
  constructor(argument?: ChatInputCommandInteraction | GuildMessage | ModalSubmitInteraction) {
    this.client = container.client;
    if (argument instanceof Message) {
      this.channel = argument.channel;
      this.moderatorId = argument.member.id;
    } else if (argument instanceof ModalSubmitInteraction || argument instanceof ChatInputCommandInteraction) {
      if (argument.channel instanceof TextChannel || argument.channel instanceof ThreadChannel)
        this.channel = argument.channel;
      this.moderatorId = argument.member.user.id;
    } else {
      this.channel = this.client.cache.channels.log;
      this.moderatorId = this.client.guild.members.me.id;
    }
    this.guild = this.channel.guild;
    this.type = null;            // The sanction type (one of the SanctionTypes enum).
    this.config = null;          // The configuration of the action (all the messages).
    this.victim = {              // The victim of the case. It contains an ID, a User and a GuildMember.
      id: null,
      user: null,
      member: null,
    };
    this.reason = messages.global.noReason; // The reason.
    this.duration = null;        // The duration.
    this.finish = null;          // The finish timestamp.
    this.start = Date.now();     // The start timestamp.
    this.sanctionId = nanoid(8); // The id of the case.
  }

  public setSanctionId(id: string): this {
    this.sanctionId = id;
    return this;
  }

  public setVictim(personResolvable: GuildMember | User, resolveMemberAndUser = true): this {
    this.victim = getPersonFromCache(personResolvable, resolveMemberAndUser);
    return this;
  }

  public setType(type: SanctionTypes): this {
    this.type = type;
    this.config = configs[this.type].messages;
    if (this.type === SanctionTypes.Hardban)
      this.setDuration(-1, false);
    return this;
  }

  public setModeratorId(member: string): this {
    this.moderatorId = member;
    return this;
  }

  public setReason(reason?: string | null): this {
    if (reason)
      this.reason = reason;
    return this;
  }

  public setDuration(duration: number, computeFinishTimestamp: boolean): this {
    this.duration = duration;
    if (computeFinishTimestamp)
      this.finish = this.start + duration;
    return this;
  }

  public setChannel(channel: TextChannel): this {
    if (channel instanceof TextChannel)
      this.channel = channel;
    return this;
  }

  public toSchema(): ModerationDataResult {
    return {
      memberId: this.victim.id,
      type: this.type,
      moderator: this.moderatorId,
      start: this.start,
      finish: this.finish,
      duration: this.duration,
      reason: this.reason,
      revoked: false,
      sanctionId: this.sanctionId,
    };
  }
}

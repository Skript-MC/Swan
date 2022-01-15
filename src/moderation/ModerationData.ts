import type { SapphireClient } from '@sapphire/framework';
import { container } from '@sapphire/pieces';
import type { Guild, GuildTextBasedChannel, User } from 'discord.js';
import { CommandInteraction, GuildMember, Message, TextChannel } from 'discord.js';
import { nanoid } from 'nanoid';
import type { GuildMessage, ModerationDataResult, PersonInformations, SanctionInformations, } from '@/app/types';
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
  informations: SanctionInformations;

  // These informations don't have much to do with moderation data, they are just used to pass
  // data from the specific moderation action to the parent class, ModerationAction.
  // TODO: Maybe this should be put in a separate class that acts the same as ModerationData.
  file: { path: string; name: string };
  shouldPurge: boolean;
  originalWarnId: string;

  /**
   * Create moderation data from a message or from individual informations.
   *
   * @param {Message | TextChannel | AkairoClient} argument
   * * If the argument is of type Message, then it is used to get all the data (moderator, guild, client, channel...).
   * * If the argument is a TextChannel, then the channel is used to get all the data.
   * * If the argument is a AkairoClient, then the channel is set to the log channel and it is used to get all the data.
   */
  constructor(argument?: CommandInteraction | GuildMessage) {
    this.client = container.client;
    if (argument instanceof Message) {
      this.channel = argument.channel;
      this.moderatorId = argument.member.id;
    } else if (argument instanceof CommandInteraction) {
      if (argument.channel instanceof TextChannel)
        this.channel = argument.channel;
      this.moderatorId = argument.member.user.id;
    } else {
      this.channel = this.client.cache.channels.log;
      this.moderatorId = this.client.guild.me.id;
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
    this.informations = {};      // The additional information to be given to the sanction model.
    this.file = null;            // File informations if it is a ban.
    this.shouldPurge = false;    // Whether we should purge the messages of the member while hard-banning them.
    this.originalWarnId = null;  // The ID of the original warn to remove in a `.removewarn`.
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

  public setModeratorId(member: never | string): this {
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

  public setInformations(infos: Partial<SanctionInformations>): this {
    this.informations = { ...this.informations, ...infos };
    return this;
  }

  public setFile(fileInfo: { path: string; name: string }): this {
    this.file = fileInfo;
    return this;
  }

  public setShouldPurge(bool: boolean): this {
    this.shouldPurge = bool;
    return this;
  }

  public setOriginalWarnId(id: string): this {
    this.originalWarnId = id;
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
      informations: this.informations,
      sanctionId: this.sanctionId,
    };
  }
}

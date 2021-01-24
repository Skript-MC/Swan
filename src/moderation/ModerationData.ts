import { AkairoClient } from 'discord-akairo';
import { GuildMember, Message, TextChannel } from 'discord.js';
import type { Guild, User } from 'discord.js';
import { nanoid } from 'nanoid';
import type {
  GuildMessage,
  GuildTextBasedChannel,
  ModerationDataResult,
  PersonInformations,
  SanctionInformations,
} from '@/app/types';
import { SanctionTypes } from '@/app/types';
import { getPersonFromCache } from '@/app/utils';
import * as configs from '@/conf/commands/moderation';
import messages from '@/conf/messages';


class ModerationData {
  moderator: GuildMember;
  guild: Guild;
  client: AkairoClient;
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
  file: { path: string; name: string };

  /**
   * Create moderation data from a message or from individual informations.
   *
   * @param {Message | TextChannel | AkairoClient} messageOrChannelOrClient
   * * If the argument is of type Message, then it is used to get all the data (moderator, guild, client, channel...).
   * * If the argument is a TextChannel, then the channel is used to get all the data.
   * * If the argument is a AkairoClient, then the channel is set to the log channel and it is used to get all the data.
   */
  constructor(argument: AkairoClient | GuildMessage | GuildTextBasedChannel) {
    if (argument instanceof Message) {
      this.moderator = argument.member;
      this.guild = argument.guild;
      this.client = argument.client as AkairoClient;
      this.channel = argument.channel;
    } else if (argument instanceof AkairoClient) {
      this.client = argument;
      this.channel = this.client.cachedChannels.log;
      this.guild = this.channel.guild;
      this.moderator = this.guild.me;
    } else {
      this.channel = argument;
      this.guild = this.channel.guild;
      this.moderator = this.guild.me;
      this.client = this.guild.client as AkairoClient;
    }
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
  }

  public setVictim(personResolvable: GuildMember | User, resolveMemberAndUser = true): this {
    this.victim = getPersonFromCache(personResolvable, this.client, resolveMemberAndUser);
    return this;
  }

  public setType(type: SanctionTypes): this {
    this.type = type;
    this.config = configs[this.type].messages;
    if (this.type === SanctionTypes.Hardban)
      this.setDuration(-1, false);
    return this;
  }

  public setModerator(member: GuildMember | never): this {
    if (member instanceof GuildMember)
      this.moderator = member;
    return this;
  }

  public setReason(reason?: string): this {
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

  public setPrivateChannel(channel: TextChannel): this {
    if (channel instanceof TextChannel)
      this.channel = channel;
    return this;
  }

  public setInformations(infos: Record<string, unknown>): this {
    this.informations = { ...this.informations, ...infos };
    return this;
  }

  public setFile(fileInfo: { path: string; name: string }): this {
    this.file = fileInfo;
    return this;
  }

  public toSchema(): ModerationDataResult {
    return {
      memberId: this.victim.id,
      type: this.type,
      moderator: this.moderator.id,
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

export default ModerationData;

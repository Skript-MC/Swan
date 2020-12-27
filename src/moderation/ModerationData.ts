import { AkairoClient } from 'discord-akairo';
import {
  User,
  GuildMember,
  Message,
  TextChannel,
} from 'discord.js';
import type { Guild } from 'discord.js';
import { nanoid } from 'nanoid';
import * as configs from '../../config/commands/moderation';
import messages from '../../config/messages';
import type {
  GuildTextBasedChannel,
  GuildMessage,
  SanctionTypes,
  VictimInformations,
  SanctionInformations,
  DataResult,
} from '../types';


class ModerationData {
  moderator: GuildMember;
  guild: Guild;
  client: AkairoClient;
  channel: GuildTextBasedChannel;
  type?: SanctionTypes;
  config?: Record<string, string>;
  victim: VictimInformations;
  reason: string;
  duration?: number;
  finish?: number;
  start: number;
  privateChannel?: TextChannel;
  id: string;
  informations: SanctionInformations;

  /**
   * Create moderation data from a message or from individual informations
   *
   * @param {Message | TextChannel | AkairoClient} messageOrChannelOrClient
   * * If the argument is of type Message, then it is used to get all the data (moderator, guild, client, channel...)
   * * If the argument is a TextChannel, then the channel is used to get all the data
   * * If the argument is a AkairoClient, then the channel is set to the log channel, and it is used to get all the data
   */
  constructor(argument: GuildMessage | GuildTextBasedChannel | AkairoClient) {
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
    this.type = null;           // The sanction type (one of the SanctionTypes enum)
    this.config = null;         // The configuration of the action (all the messages)
    this.victim = {             // The victim of the case. It contains an ID, a User? and a GuildMember?
      id: null,
      user: null,
      member: null,
    };
    this.reason = messages.global.noReason; // The reason
    this.duration = null;       // The duration
    this.finish = null;         // The finish timestamp
    this.start = Date.now();    // The start timestamp
    this.privateChannel = null; // The private channel (in case of a ban)
    this.id = nanoid(8);        // The id of the case
    this.informations = {};     // The additional information to be given to the sanction model
  }

  public setVictim(personResolvable: GuildMember | User, resolveMemberAndUser = true): this {
    const member = personResolvable instanceof GuildMember
      ? personResolvable
      : this.guild.members.resolve(personResolvable);

    let user = this.client.users.resolve(personResolvable);
    if (member instanceof GuildMember)
      user = member.user;
    else if (personResolvable instanceof User)
      user = personResolvable;

    const missingData = resolveMemberAndUser
      ? !member || !user
      : !member && !user;
    if (missingData)
      throw new Error('Victim Not Found');

    this.victim.id = (member || user).id;
    this.victim.user = user;
    this.victim.member = member;

    return this;
  }

  public setType(type: SanctionTypes): this {
    this.type = type;
    this.config = configs[this.type].messages;
    return this;
  }

  public setModerator(member: GuildMember | never): this {
    if (member instanceof GuildMember)
      this.moderator = member;
    return this;
  }

  public setReason(reason: string): this {
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

  public toSchema(): DataResult {
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
      id: this.id,
    };
  }
}

export default ModerationData;

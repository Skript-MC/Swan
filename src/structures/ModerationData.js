import {
  Client,
  Guild,
  User,
  GuildMember,
  Message,
  TextChannel,
} from 'discord.js';
import { nanoid } from 'nanoid';
import * as configs from '../../config/commands/moderation';
import messages from '../../config/messages';
import { constants } from '../utils';

class ModerationData {
  /**
   * Create moderation data from a message
   *
   * @param  {Message} message - The message to get all the data from (moderator, guild, client, channel...)
   */

  // TODO: In the following overload, regroup moderator and client? As in most/all of the cases, if we use
  // this overload it is because of an action performed automatically, so the moderator has to be the client.
  /**
   * Create moderation data from individual informations
   *
   * @param {GuildMember} moderator - The moderator that created the sanction
   * @param {Guild} guild - The guild where the sanction took place
   * @param {Client} client - The client that instanciated this action
   * @param {TextChannel} channel - The channel where feedback will be send
   */
  constructor(...args) {
    if (args[0] instanceof Message) {
      this.moderator = args[0].member;
      this.guild = args[0].guild;
      this.client = args[0].client;
      this.channel = args[0].channel;
    } else if (args[0] instanceof GuildMember
        && args[1] instanceof Guild
        && args[2] instanceof Client
        && args[3] instanceof TextChannel) {
      this.moderator = args[0];
      this.guild = args[1];
      this.client = args[2];
      this.channel = args[3];
    } else {
      throw new TypeError('ModerationData: Incorrect parameter types');
    }
    this.type = null;           // The sanction type (one of constants.SANCTIONS.TYPE)
    this.config = null;         // The configuration of the action (all the messages)
    this.victim = {                  // The victim of the case. It contains an ID, a User? and a GuildMember?
      id: null,
      user: null,
      member: null,
    };
    this.reason = messages.global.noReason; // The reason
    this.duration = null;       // The duration
    this.finish = null;         // The finish timestamp
    this.start = Date.now();         // The start timestamp
    this.privateChannel = null; // The private channel (in case of a ban)
    this.id = nanoid(8);             // The id of the case
    this.informations = {};          // The additional information to be given to the sanction model
  }

  setVictim(personResolvable, resolveMemberAndUser = true) {
    /* eslint-disable prefer-destructuring */
    const member = personResolvable instanceof GuildMember
      ? personResolvable
      : this.guild.members.resolve(personResolvable);

    let user;
    if (member instanceof GuildMember)
      user = member.user;
    else if (personResolvable instanceof User)
      user = personResolvable;
    else
      user = this.client.users.resolve(personResolvable);

    const missingData = resolveMemberAndUser
      ? !member || !user
      : !member && !user;
    if (missingData)
      throw new Error('Victim Not Found');

    this.victim.id = member instanceof GuildMember ? member.id : user.id;
    this.victim.user = user;
    this.victim.member = member;

    return this;
  }

  setType(type) {
    if (Object.values(constants.SANCTIONS.TYPES).includes(type)) {
      this.type = type;
      this.config = configs[this.type].messages;
      return this;
    }
    throw new Error('Internal Error: Sanction Type Unknown');
  }

  setModerator(member) {
    if (member instanceof GuildMember)
      this.moderator = member;
    return this;
  }

  setReason(reason) {
    this.reason = reason;
    return this;
  }

  setDuration(duration, computeFinishTimestamp) {
    this.duration = duration;
    if (computeFinishTimestamp)
      this.finish = this.start + duration;
    return this;
  }

  setPrivateChannel(channel) {
    if (channel instanceof TextChannel)
      this.channel = channel;
    return this;
  }

  setInformations(infos) {
    this.informations = { ...this.informations, ...infos };
    return this;
  }

  toSchema() {
    return {
      memberId: this.victim.id,
      type: this.type,
      moderator: this.moderator.id,
      start: this.start,
      duration: this.duration,
      reason: this.reason,
      revoked: false,
      informations: this.informations,
      id: this.id,
    };
  }
}

export default ModerationData;

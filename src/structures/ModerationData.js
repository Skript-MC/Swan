import { GuildMember } from 'discord.js';
import { client } from '../main';
import { uid } from '../utils';

class ModerationData {
  constructor() {
    this.guild = client.guild;
    this.type = undefined; // The sanction type (enum of ACTION_TYPE)
    this.member = undefined; // The victim GuildMember object
    this.user = undefined; // The victim User object
    this.moderator = undefined; // The moderator (GuildMember | User) object
    this.reason = undefined; // The reason
    this.color = undefined; // The embed color
    this.duration = undefined; // The duration
    this.finish = undefined; // The finish timestamp
    this.privateChannel = undefined; // The private channel (in case of a ban)
    this.messageChannel = undefined; // The channel the command was executed in
    this.sendSuccessIfBot = false; // Wether or not send success messages if the moderator is a bot
    this.file = undefined; // The file to send along with the log embed
    this.warnId = undefined; // If it is a "remove warn", this will be set to the id of the warn to remove
    this.hardbanIfNoMessages = false; // If this is true, the user will be hardban if he doesn't write any message in the private channel
    this.silent = false; // Don't send private message to the victim
    this.id = uid(); // The id of the case
  }

  setType(type) {
    this.type = type;
    return this;
  }

  setMember(member) {
    this.member = member;
    this.user = member.user;
    return this;
  }

  setUser(user) {
    this.user = user;
    return this;
  }

  setVictim(victim) {
    if (victim instanceof GuildMember) this.setMember(victim);
    else this.setUser(victim);
    return this;
  }

  setModerator(member) {
    this.moderator = member;
    return this;
  }

  setReason(reason) {
    this.reason = reason;
    return this;
  }

  setColor(color) {
    this.color = color;
    return this;
  }

  setDuration(duration) {
    this.duration = duration;
    return this;
  }

  setFinishTimestamp() {
    this.finish = Date.now() + this.duration;
    return this;
  }

  setPrivateChannel(channel) {
    this.privateChannel = channel;
    return this;
  }

  setMessageChannel(channel) {
    this.messageChannel = channel;
    return this;
  }

  setWarnId(id) {
    this.warnId = id;
    return this;
  }

  setFile(file) {
    this.file = file;
    return this;
  }

  shouldSendSuccessIfBot(bool) {
    this.shouldSendSuccessIfBot = bool;
    return this;
  }

  shouldHardbanIfNoMessages(bool) {
    this.hardbanIfNoMessages = bool;
    return this;
  }

  shouldBeSilent(bool) {
    this.silent = bool;
    return this;
  }

  getData(compact = true) {
    return {
      guild: compact && this.guild ? this.guild.id : this.guild,
      type: this.type,
      member: compact && this.member ? this.member.id : this.member,
      user: compact && this.user ? this.user.id : this.user,
      moderator: compact && this.moderator ? this.moderator.id : this.moderator,
      reason: this.reason,
      color: this.color,
      duration: this.duration,
      finish: this.finish,
      privateChannel: compact && this.privateChannel ? this.privateChannel.id : this.privateChannel,
      messageChannel: compact && this.messageChannel ? this.messageChannel.id : this.privateChannel,
      sendSuccessIfBot: this.shouldSendSuccessIfBot,
      file: this.file,
      warnId: this.warnId,
      hardbanIfNoMessages: this.hardbanIfNoMessages,
      silent: this.silent,
      id: this.id,
    };
  }
}

export default ModerationData;

class HelpChannelManager {
  constructor(client) {
    this.client = client;
    this.basicHelpChannels = [];
    this.extraHelpChannels = [];
    this.inactivityTime = this.client.config.miscellaneous.helpChannelInactivityTime;
    this.inactivityMessages = this.client.config.miscellaneous.helpChannelInactivityMessages;

    for (const channelId of client.config.channels.helpSkript) {
      const chan = client.guild.channels.cache.get(channelId);
      if (chan) this.basicHelpChannels.push(chan);
    }
    for (const channelId of client.config.channels.extraHelpSkript) {
      const chan = client.guild.channels.cache.get(channelId);
      if (chan) this.extraHelpChannels.push();
    }
  }

  lockChannels() {
    for (const channel of this.extraHelpChannels) {
      channel.overwritePermissions([{
        id: this.client.config.roles.everyone,
        deny: ['VIEW_CHANNEL'],
      }, {
        id: this.client.config.roles.staff,
        allow: ['VIEW_CHANNEL'],
      }]);
    }
  }

  unlockChannels() {
    for (const channel of this.extraHelpChannels) {
      channel.overwritePermissions([{
        id: this.client.config.roles.everyone,
        allow: ['VIEW_CHANNEL'],
      }]);
      channel.send(':white_check_mark: Salon débloqué !');
    }
  }

  isRecent(message) {
    return message?.createdTimestamp > (Date.now() - this.inactivityTime);
  }

  async cacheMessages() {
    const promises = [];
    for (const chan of this.basicHelpChannels.concat(this.extraHelpChannels)) {
      promises.push(chan.messages.fetch({ limit: this.inactivityMessages }).catch(console.error));
    }
    await Promise.all(promises).catch(console.error);
  }

  isNotVisibleToEveryone(channel) {
    const { everyone } = this.client.config.roles;
    // Check if @everyone can't see the channel
    return channel.permissionOverwrites
      .get(everyone)
      .deny.has('VIEW_CHANNEL');
  }

  hasEnoughRecentMessages(channel) {
    // Get the first message of the group of the last N messages (where N = this.inactivityMessages)
    const cache = channel.messages.cache.array().sort((a, b) => b.createdTimestamp - a.createdTimestamp);
    const firstMessage = cache[this.inactivityMessages - 1];
    // Check if it is recent
    return channel.messages.cache.size >= this.inactivityMessages && this.isRecent(firstMessage);
  }

  async checkChannelActivity() {
    await this.cacheMessages();

    if (this.extraHelpChannels.every(chan => this.isNotVisibleToEveryone(chan))) {
      if (this.basicHelpChannels.every(chan => this.hasEnoughRecentMessages(chan))) {
        this.unlockChannels();
      }
    } else if (this.extraHelpChannels.every(chan => !this.isRecent(chan.lastMessage))) {
      this.lockChannels();
    }
  }
}

export default HelpChannelManager;

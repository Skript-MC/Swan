import type { Message } from 'discord.js';
import { Collection, Permissions, TextChannel } from 'discord.js';
import pupa from 'pupa';
import Task from '@/app/structures/Task';
import settings from '@/conf/settings';
import { helpChannels as config } from '@/conf/tasks';

class HelpChannels extends Task {
  private readonly _basicHelpChannels: TextChannel[] = [];
  private readonly _extraHelpChannels: TextChannel[] = [];

  constructor() {
    super('helpChannels', {
      // Every 5 minutes
      cron: '*/5 * * * *',
    });
  }

  public async exec(): Promise<void> {
    if (this._basicHelpChannels.length === 0)
      await this._init();

    if (this._extraHelpChannels.every(chan => this._isNotVisibleToEveryone(chan))) {
      for (const channel of this._basicHelpChannels) {
        if (await this._hasEnoughRecentMessages(channel)) {
          await this._unlockChannels();
          break;
        }
      }
    } else if (this._extraHelpChannels.every(chan => !this._isRecent(chan.lastMessage))) {
      await this._lockChannels();
    }
  }

  private async _init(): Promise<void> {
    for (const channelId of settings.channels.skriptHelp) {
      const chan = await this.client.channels.fetch(channelId);
      if (chan instanceof TextChannel)
        this._basicHelpChannels.push(chan);
    }
    for (const channelId of settings.channels.skriptExtraHelp) {
      const chan = await this.client.channels.fetch(channelId);
      if (chan instanceof TextChannel)
        this._extraHelpChannels.push(chan);
    }
  }

  private async _lockChannels(): Promise<void> {
    for (const channel of this._extraHelpChannels) {
      await channel.overwritePermissions([{
        id: settings.roles.everyone,
        deny: [Permissions.FLAGS.SEND_MESSAGES],
      }, {
        id: settings.roles.staff,
        allow: [Permissions.FLAGS.SEND_MESSAGES],
      }]);
      await channel.send(pupa(config.lockMessage, { channels: this._basicHelpChannels.join(', ') }));
    }
  }

  private async _unlockChannels(): Promise<void> {
    for (const channel of this._extraHelpChannels) {
      await channel.overwritePermissions([{
        id: settings.roles.everyone,
        allow: [Permissions.FLAGS.SEND_MESSAGES],
      }]);
      await channel.send(config.unlockMessage);
    }
  }

  private _isNotVisibleToEveryone(channel: TextChannel): boolean {
    const { everyone } = settings.roles;
    // Check if @everyone can't see the channel
    return channel.permissionOverwrites
      .get(everyone)
      ?.deny.has(Permissions.FLAGS.SEND_MESSAGES);
  }

  private _isRecent(message: Message): boolean {
    return message?.createdTimestamp > (Date.now() - config.inactivityTime);
  }

  private async _hasEnoughRecentMessages(channel: TextChannel): Promise<boolean> {
    const lastMessages = await channel.messages.fetch({ limit: config.inactivityMessages }, false).catch(console.error);
    if (!(lastMessages instanceof Collection))
      return true;
    // Get the first message of the group of the last N messages (where N = this.inactivityMessages)
    const sortedMessages = lastMessages.array().sort((a, b) => b.createdTimestamp - a.createdTimestamp);
    const firstMessage = sortedMessages[config.inactivityMessages - 1];
    // Check if it is recent
    return this._isRecent(firstMessage);
  }
}

export default HelpChannels;

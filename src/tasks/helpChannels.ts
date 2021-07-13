import { ApplyOptions } from '@sapphire/decorators';
import type { Message } from 'discord.js';
import { Permissions, TextChannel } from 'discord.js';
import pupa from 'pupa';
import type { TaskOptions } from '@/app/structures/tasks/Task';
import Task from '@/app/structures/tasks/Task';
import settings from '@/conf/settings';
import { helpChannels as config } from '@/conf/tasks';

@ApplyOptions<TaskOptions>({ cron: '*/5 * * * *' })
export default class HelpChannels extends Task {
  private _basicHelpChannels: Array<[channel: TextChannel, lastMessages: Message[]]> = [];
  private _extraHelpChannels: Array<[channel: TextChannel, lastMessages: Message[]]> = [];

  public async run(): Promise<void> {
    // Refresh channels data.
    await this._initChannels();

    // If the extra channels are locked and the basic channels meet the requirements.
    if (this._extraHelpChannels.every(chan => this._isLocked(chan[0]))
      && this._basicHelpChannels.every(chan => this._meetRequirements(chan[1], config.basic.inactivityTime))) {
        for (const chan of this._extraHelpChannels)
          await this._unlockChannel(chan[0]);
        return;
    }

    // If the extra channels are unlocked.
    if (this._extraHelpChannels.every(chan => !this._isLocked(chan[0]))
      && this._extraHelpChannels.every(chan => !this._meetRequirements(chan[1], config.extra.inactivityTime))) {
      for (const chan of this._extraHelpChannels)
          await this._lockChannel(chan[0]);
    }
  }

  private async _fetchLastMessages(channel: TextChannel, limit: number): Promise<Message[]> {
    const lastMessages = await channel.messages.fetch({ limit }, false).catch(console.error);
    if (!lastMessages)
      return [];
    // Get the first message of the group of the last N messages (where N = this.inactivityMessages)
    return lastMessages.array().sort((a, b) => b.createdTimestamp - a.createdTimestamp);
  }

  private _isMessageRecent(message: Message, time: number): boolean {
    return message?.createdTimestamp > (Date.now() - time);
  }

  private _meetRequirements(lastMessages: Message[], time: number): boolean {
    const lastMessage = lastMessages[lastMessages.length - 1];
    if (!lastMessage)
      return false;
    return this._isMessageRecent(lastMessage, time);
  }

  private async _unlockChannel(channel: TextChannel): Promise<void> {
    await channel.lockPermissions();
    await channel.send(config.unlockMessage);
  }

  private _isLocked(channel: TextChannel): boolean {
    const { everyone } = settings.roles;
    // Check if @everyone can't write in the channel
    return Boolean(channel.permissionOverwrites
      .get(everyone)
      ?.deny.has(Permissions.FLAGS.SEND_MESSAGES));
  }

  private async _lockChannel(channel: TextChannel): Promise<void> {
    await channel.overwritePermissions([{
      id: settings.roles.everyone,
      deny: [Permissions.FLAGS.SEND_MESSAGES],
    }, {
      id: settings.roles.staff,
      allow: [Permissions.FLAGS.SEND_MESSAGES],
    }]);
    await channel.send(pupa(config.lockMessage, { channels: this._basicHelpChannels.map(chan => chan[0]).join(', ') }));
  }

  private async _initChannels(): Promise<void> {
    // Clear basic and extra help channels
    this._basicHelpChannels = [];
    this._extraHelpChannels = [];

    for (const channelId of settings.channels.skriptHelp) {
      const chan = await this.context.client.channels.fetch(channelId);
      if (!(chan instanceof TextChannel))
        continue;
      const lastMessages = await this._fetchLastMessages(chan, config.extra.limitMessages);
      this._basicHelpChannels.push([chan, lastMessages]);
    }
    for (const channelId of settings.channels.skriptExtraHelp) {
      const chan = await this.context.client.channels.fetch(channelId);
      if (!(chan instanceof TextChannel))
        continue;
      const lastMessages = await this._fetchLastMessages(chan, config.extra.limitMessages);
      this._extraHelpChannels.push([chan, lastMessages]);
    }
  }
}

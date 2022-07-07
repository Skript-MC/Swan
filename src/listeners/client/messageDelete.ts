import type { Message } from 'discord.js';
import { DMChannel } from 'discord.js';
import SwanListener from '@/app/structures/SwanListener';
import type MessageTask from '@/app/structures/tasks/listeners/MessageTask';
import type { GuildMessage } from '@/app/types';

export default class MessageDeleteListener extends SwanListener {
  public override async run(message: Message): Promise<void> {
    if (message.author.bot
      || message.system
      || message.channel instanceof DMChannel)
      return;

    const tasks = this.getTasks().map(task => task as MessageTask);
    for (const task of tasks)
      await task.runListener(message as GuildMessage, null);
  }
}

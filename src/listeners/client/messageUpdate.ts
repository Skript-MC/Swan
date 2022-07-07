import SwanListener from '@/app/structures/SwanListener';
import type MessageTask from '@/app/structures/tasks/listeners/MessageTask';
import type { GuildMessage } from '@/app/types';

export default class MessageUpdateListener extends SwanListener {
  public override async run(oldMessage: GuildMessage, newMessage: GuildMessage): Promise<void> {
    if (newMessage.author.bot || newMessage.system)
      return;
    const tasks = this.getTasks().map(task => task as MessageTask);
    for (const task of tasks)
      await task.runListener(oldMessage, newMessage);
  }
}

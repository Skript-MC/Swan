import type { MessageReaction, User } from 'discord.js';
import { DMChannel } from 'discord.js';
import SwanListener from '@/app/structures/SwanListener';
import type MessageReactionTask from '@/app/structures/tasks/listeners/MessageReactionTask';

export default class MessageReactionAddListener extends SwanListener {
  public override async run(reaction: MessageReaction, user: User): Promise<void> {
    if (user.bot || reaction.message.channel instanceof DMChannel)
      return;
    const tasks = this.getTasks().map(task => task as MessageReactionTask);
    for (const task of tasks)
      await task.runListener(reaction, user);
  }
}

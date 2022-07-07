import type { MessageReaction, User } from 'discord.js';
import Task from '@/app/structures/tasks/Task';

export default abstract class MessageReactionTask extends Task {
  public run(): void {
    throw new Error('Method not implemented.');
  }

  public abstract runListener(reaction: MessageReaction, user: User): Promise<void>;
}

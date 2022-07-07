import Task from '@/app/structures/tasks/Task';
import type { GuildMessage } from '@/app/types';

export default abstract class MessageTask extends Task {
  public run(): void {
    throw new Error('Method not implemented.');
  }

  public abstract runListener(message: GuildMessage, newMessage: GuildMessage | null): Promise<boolean>;
}

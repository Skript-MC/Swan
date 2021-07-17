import { Event } from '@sapphire/framework';
import type { TaskErrorPayload } from '@/app/structures/tasks/Task';

export default class TaskErrorEvent extends Event {
  public run(error: Error, { piece: task }: TaskErrorPayload): void {
    this.context.logger.error('Oops, something went wrong with a task!');
    this.context.logger.info(`Task: ${task.name}`);
    this.context.logger.info(`Cron: ${task.cron}`);
    if (process.env.NODE_ENV === 'production')
      throw new Error(error.stack);
    else
      this.context.logger.error(error.stack);
  }
}

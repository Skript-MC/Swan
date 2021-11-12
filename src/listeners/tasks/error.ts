import { Listener } from '@sapphire/framework';
import type { TaskErrorPayload } from '@/app/structures/tasks/Task';

export default class TaskErrorListener extends Listener {
  public override run(error: Error, { piece: task }: TaskErrorPayload): void {
    this.container.logger.error('Oops, something went wrong with a task!');
    this.container.logger.info(`Task: ${task.name}`);
    this.container.logger.info(`Cron: ${task.cron}`);
    if (process.env.NODE_ENV === 'production')
      throw new Error(error.stack);
    else
      this.container.logger.error(error.stack);
  }
}

import { Listener } from '@sapphire/framework';
import { captureException } from '@sentry/node';
import type { TaskErrorPayload } from '#structures/tasks/Task';

export class TaskErrorListener extends Listener {
  public override run(error: Error, { piece: task }: TaskErrorPayload): void {
    captureException(error);
    this.container.logger.error('Oops, something went wrong with a task!');
    this.container.logger.info(`Task: ${task.name}`);
    this.container.logger.info(`Cron or interval: ${task.cron ?? task.interval}`);
    this.container.logger.error(error.stack);
  }
}

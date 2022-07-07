import { captureException } from '@sentry/node';
import SwanListener from '@/app/structures/SwanListener';
import type { TaskErrorPayload } from '@/app/structures/tasks/Task';

export default class TaskErrorListener extends SwanListener {
  public override run(error: Error, { piece: task }: TaskErrorPayload): void {
    captureException(error);
    this.container.logger.error('Oops, something went wrong with a task!');
    this.container.logger.info(`Task: ${task.name}`);
    this.container.logger.info(`Cron or interval: ${task.cron ?? task.interval}`);
    this.container.logger.error(error.stack);
  }
}

import { captureException, flush } from '@sentry/node';
import { Listener } from 'discord-akairo';
import Logger from '@/app/structures/Logger';
import type Task from '@/app/structures/Task';

class TaskHandlerErrorListener extends Listener {
  constructor() {
    super('taskHandlerError', {
      event: 'error',
      emitter: 'taskHandler',
    });
  }

  public async exec(error: Error, task: Task): Promise<void> {
    Logger.error('Oops, something went wrong with a task!');
    Logger.detail(`Task: ${task}`);
    Logger.detail(`Cron: ${task.cron}`);
    if (process.env.NODE_ENV === 'production') {
      captureException(error);
      await flush(5000);
      // eslint-disable-next-line node/no-process-exit
      process.exit(1);
    } else {
      Logger.error(error.stack);
    }
  }
}

export default TaskHandlerErrorListener;

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

  public exec(error: Error, task: Task): void {
    Logger.error('Oops, something went wrong with a task!');
    Logger.detail(`Task: ${task}`);
    Logger.detail(`Cron: ${task.cron}`);
    if (process.env.NODE_ENV === 'production')
      throw new Error(error.stack);
    else
      Logger.error(error.stack);
  }
}

export default TaskHandlerErrorListener;

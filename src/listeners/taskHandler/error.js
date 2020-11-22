import { Listener } from 'discord-akairo';
import Logger from '../../structures/Logger';

class TaskHandlerErrorListener extends Listener {
  constructor() {
    super('taskHandlerError', {
      event: 'error',
      emitter: 'taskHandler',
    });
  }

  exec(error, task) {
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

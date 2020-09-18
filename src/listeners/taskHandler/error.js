import { Listener } from 'discord-akairo';

class TaskHandlerErrorListener extends Listener {
  constructor() {
    super('taskHandlerError', {
      event: 'error',
      emitter: 'taskHandler',
    });
  }

  exec(error, task) {
    this.client.logger.error('Oops, something went wrong with a task!');
    this.client.logger.detail(`Task: ${task}`);
    this.client.logger.detail(`Cron: ${task.cron}`);
    if (process.env.NODE_ENV === 'production')
      throw new Error(error.stack);
    else
      this.client.logger.error(error.stack);
  }
}

export default TaskHandlerErrorListener;

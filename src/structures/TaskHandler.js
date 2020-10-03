import { AkairoError, AkairoHandler } from 'discord-akairo';
import { Collection } from 'discord.js';
import cron from 'node-cron';
import Task from './Task';

class TaskHandler extends AkairoHandler {
  constructor(client, {
    directory,
    classToHandle = Task,
    extensions = ['.js', '.ts'],
    automateCategories,
    loadFilter,
  } = {}) {
    if (!(classToHandle.prototype instanceof Task || classToHandle === Task))
      throw new AkairoError('INVALID_CLASS_TO_HANDLE', classToHandle.name, Task.name);

    super(client, {
      directory,
      classToHandle,
      extensions,
      automateCategories,
      loadFilter,
    });

    this.tasks = new Collection();
  }

  register(task, filepath) {
    super.register(task, filepath);
    task.exec = task.exec.bind(task);
    this.addToSchedule(task.id);
    return task;
  }

  deregister(task) {
    this.removeFromSchedule(task.id);
    super.deregister(task);
  }

  addToSchedule(id) {
    const task = this.modules.get(id.toString());
    if (!task)
      throw new AkairoError('MODULE_NOT_FOUND', this.classToHandle.name, id);

    if (typeof task.interval === 'number') {
      const interval = setInterval(() => {
        try {
          task.exec();
        } catch (err) {
          this.emit('error', err, task);
        }
      }, task.interval);
      this.tasks.set(task.id, { type: 'interval', interval });
    } else if (cron.validate(task.cron)) {
      const schedule = cron.schedule(task.cron, () => {
        try {
          task.exec();
        } catch (err) {
          this.emit('error', err, task);
        }
      });
      this.tasks.set(task.id, { type: 'schedule', schedule });
    } else {
      throw new AkairoError('INVALID_TYPE', 'cron or interval', `cron schedule or a number (${id})`);
    }

    return task;
  }

  removeFromSchedule(id) {
    const task = this.modules.get(id.toString());
    if (!task)
      throw new AkairoError('MODULE_NOT_FOUND', this.classToHandle.name, id);

    const taskInfos = this.tasks.get(task.id);
    if (taskInfos.type === 'interval')
      clearInterval(taskInfos.interval);
    else if (taskInfos.type === 'schedule')
      taskInfos.schedule.stop().destroy();

    this.tasks.delete(task.id);
    return task;
  }
}

export default TaskHandler;

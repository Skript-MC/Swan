import { AkairoError, AkairoHandler } from 'discord-akairo';
import type { AkairoClient, AkairoHandlerOptions } from 'discord-akairo';
import { Collection } from 'discord.js';
import cron from 'node-cron';
import Task from '@/app/structures/Task';
import type { TaskInformations } from '@/app/types';


class TaskHandler extends AkairoHandler {
  tasks: Collection<string, TaskInformations>;

  constructor(client: AkairoClient, {
    classToHandle = Task,
    extensions = ['.js', '.ts'],
    directory = null,
    automateCategories = null,
    loadFilter = null,
  }: AkairoHandlerOptions) {
    if (!(classToHandle.prototype instanceof Task || classToHandle === Task))
      throw new AkairoError('INVALID_CLASS_TO_HANDLE', classToHandle.name, Task.name);

    super(client, {
      classToHandle,
      extensions,
      directory,
      automateCategories,
      loadFilter,
    });

    this.tasks = new Collection<string, TaskInformations>();
  }

  public register(task: Task, filepath: string): Task {
    super.register(task, filepath);
    task.exec = task.exec.bind(task);
    this._addToSchedule(task.id);
    return task;
  }

  public deregister(task: Task): void {
    this._removeFromSchedule(task.id);
    super.deregister(task);
  }

  private _addToSchedule(id: string): Task {
    const task = this.modules.get(id.toString());
    if (!task || !(task instanceof Task))
      throw new AkairoError('MODULE_NOT_FOUND', this.classToHandle.name, id);


    const taskFunction = async (): Promise<void> => {
      try {
        await task.exec();
      } catch (unknownError: unknown) {
        this.emit('error', unknownError as Error, task);
      }
    };

    if (typeof task.interval === 'number') {
      const interval = setInterval(taskFunction, task.interval);
      this.tasks.set(task.id, { interval });
    } else if (task.cron && cron.validate(task.cron)) {
      const schedule = cron.schedule(task.cron, taskFunction);
      this.tasks.set(task.id, { schedule });
    } else {
      throw new AkairoError('INVALID_TYPE', 'cron or interval', `cron schedule or a number (${id})`);
    }

    return task;
  }

  private _removeFromSchedule(id: string): Task {
    const task = this.modules.get(id.toString()) as Task;
    if (!task)
      throw new AkairoError('MODULE_NOT_FOUND', this.classToHandle.name, id);

    const taskInfos = this.tasks.get(task.id);
    if (taskInfos?.interval)
      clearInterval(taskInfos.interval);
    else if (taskInfos?.schedule)
      taskInfos.schedule.stop();

    this.tasks.delete(task.id);
    return task;
  }
}

export default TaskHandler;

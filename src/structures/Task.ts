import { AkairoModule } from 'discord-akairo';
import type { AkairoModuleOptions } from 'discord-akairo';

interface TaskModuleOptions extends AkairoModuleOptions {
  cron?: string;
  interval?: number;
}

abstract class Task extends AkairoModule {
  interval?: number;
  cron?: string;

  constructor(id: string, { interval, cron }: TaskModuleOptions) {
    super(id);
    if (!interval && !cron)
      throw new TypeError(`No interval was given in Task ${id}. Expected option 'interval (number)' or 'cron (string)'.`);
    this.interval = interval;
    this.cron = cron;
  }

  public abstract exec(): Promise<void> | void;
}

export default Task;

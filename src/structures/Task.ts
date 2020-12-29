import { AkairoModule } from 'discord-akairo';

abstract class Task extends AkairoModule {
  interval?: number;
  cron?: string;

  constructor(id: string, {
    category = null,
    interval = null,
    cron = null,
  } = {}) {
    super(id, { category });
    if (!interval && !cron)
      throw new TypeError(`No interval was given in Task ${id}. Expected option 'interval (number)' or 'cron (string)'.`);
    this.interval = interval;
    this.cron = cron;
  }

  public abstract exec(): Promise<void> | void;
}

export default Task;

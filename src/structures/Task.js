import { AkairoError, AkairoModule } from 'discord-akairo';

class Task extends AkairoModule {
  constructor(id, {
    category,
    interval,
    cron,
  } = {}) {
    super(id, { category });
    this.interval = interval;
    this.cron = cron;
  }

  exec() {
    throw new AkairoError('NOT_IMPLEMENTED', this.constructor.name, 'exec');
  }
}

export default Task;

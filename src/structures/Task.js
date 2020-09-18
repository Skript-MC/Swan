import { AkairoError, AkairoModule } from 'discord-akairo';

class Task extends AkairoModule {
  constructor(id, {
    category,
    cron,
  } = {}) {
    super(id, { category });
    this.cron = cron;
  }

  exec() {
    throw new AkairoError('NOT_IMPLEMENTED', this.constructor.name, 'exec');
  }
}

export default Task;

import { Listener } from 'discord-akairo';

class UncaughtExceptionListener extends Listener {
  constructor() {
    super('uncaughtException', {
      event: 'uncaughtException',
      emitter: 'process',
    });
  }

  exec(error) {
    this.client.logger.error('Oops, something went wrong with Swan! (uncaughtException)');
    if (process.env.NODE_ENV === 'production') {
      throw new Error(error.stack);
    } else {
      this.client.logger.error(error.stack);
      this.client.logger.warn('An uncaughtException just occurred. Swan is now in an undefined state. Continuing using it might lead to unforeseen and unpredictable issues.');
    }
  }
}

export default UncaughtExceptionListener;

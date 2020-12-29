import { Listener } from 'discord-akairo';
import Logger from '../../structures/Logger';

class UncaughtExceptionListener extends Listener {
  constructor() {
    super('uncaughtException', {
      event: 'uncaughtException',
      emitter: 'process',
    });
  }

  public exec(error: Error): void {
    Logger.error('Oops, something went wrong with Swan! (uncaughtException)');
    if (process.env.NODE_ENV === 'production') {
      throw new Error(error.stack);
    } else {
      Logger.error(error.stack);
      Logger.warn('An uncaughtException just occurred. Swan is now in an undefined state. Continuing using it might lead to unforeseen and unpredictable issues.');
    }
  }
}

export default UncaughtExceptionListener;

import { captureException, flush } from '@sentry/node';
import { Listener } from 'discord-akairo';
import Logger from '@/app/structures/Logger';

class UncaughtExceptionListener extends Listener {
  constructor() {
    super('uncaughtException', {
      event: 'uncaughtException',
      emitter: 'process',
    });
  }

  public async exec(error: Error): Promise<void> {
    Logger.error('Oops, something went wrong with Swan! (uncaughtException)');
    if (process.env.NODE_ENV === 'production') {
      captureException(error);
      await flush(5000);
      // eslint-disable-next-line node/no-process-exit
      process.exit(1);
    } else {
      Logger.error(error.stack);
      Logger.warn('An uncaughtException just occurred. Swan is now in an undefined state. Continuing using it might lead to unforeseen and unpredictable issues.');
    }
  }
}

export default UncaughtExceptionListener;

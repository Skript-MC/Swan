import { captureException } from '@sentry/node';
import { Listener } from 'discord-akairo';
import Logger from '@/app/structures/Logger';

class UnhandledRejectionListener extends Listener {
  constructor() {
    super('unhandledRejection', {
      event: 'unhandledRejection',
      emitter: 'process',
    });
  }

  public exec(error: Error): void {
    captureException(error);
    Logger.error('Oops, something went wrong with Swan! (unhandledRejection)');
    Logger.error(error.stack);
  }
}

export default UnhandledRejectionListener;

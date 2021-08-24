import { captureException, flush } from '@sentry/node';
import { Listener } from 'discord-akairo';
import Logger from '@/app/structures/Logger';

class ClientErrorListener extends Listener {
  constructor() {
    super('clientError', {
      event: 'error',
      emitter: 'client',
    });
  }

  public async exec(error: Error): Promise<void> {
    Logger.error('Oops, something went wrong with the Swan Client!');
    if (process.env.NODE_ENV === 'production') {
      captureException(error);
      await flush(5000);
      // eslint-disable-next-line node/no-process-exit
      process.exit(1);
    } else {
      Logger.error(error.stack);
    }
  }
}

export default ClientErrorListener;

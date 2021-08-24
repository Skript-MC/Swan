import { captureException, flush } from '@sentry/node';
import { Listener } from 'discord-akairo';
import type { Inhibitor } from 'discord-akairo';
import Logger from '@/app/structures/Logger';

class InhibitorHandlerErrorListener extends Listener {
  constructor() {
    super('inhibitorHandlerError', {
      event: 'error',
      emitter: 'inhibitorHandler',
    });
  }

  public async exec(error: Error, inhibitor: Inhibitor): Promise<void> {
    Logger.error('Oops, something went wrong with an inhibitor!');
    Logger.detail(`Inhibitor: ${inhibitor.id}`);
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

export default InhibitorHandlerErrorListener;

import { captureException, flush } from '@sentry/node';
import { Listener } from 'discord-akairo';
import Logger from '@/app/structures/Logger';

class ListenerHandlerErrorListener extends Listener {
  constructor() {
    super('listenerHandlerError', {
      event: 'error',
      emitter: 'listenerHandler',
    });
  }

  public async exec(error: Error, listener: Listener): Promise<void> {
    Logger.error('Oops, something went wrong with a listener!');
    Logger.detail(`Listener: ${listener.id}`);
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

export default ListenerHandlerErrorListener;

import { captureException } from '@sentry/node';
import { Listener } from 'discord-akairo';
import Logger from '@/app/structures/Logger';

class ListenerHandlerErrorListener extends Listener {
  constructor() {
    super('listenerHandlerError', {
      event: 'error',
      emitter: 'listenerHandler',
    });
  }

  public exec(error: Error, listener: Listener): void {
    captureException(error);
    Logger.error('Oops, something went wrong with a listener!');
    Logger.detail(`Listener: ${listener.id}`);
    Logger.error(error.stack);
  }
}

export default ListenerHandlerErrorListener;

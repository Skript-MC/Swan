import { captureException } from '@sentry/node';
import { Listener } from 'discord-akairo';
import Logger from '@/app/structures/Logger';

class ClientErrorListener extends Listener {
  constructor() {
    super('clientError', {
      event: 'error',
      emitter: 'client',
    });
  }

  public exec(error: Error): void {
    captureException(error);
    Logger.error('Oops, something went wrong with the Swan Client!');
    Logger.error(error.stack);
  }
}

export default ClientErrorListener;

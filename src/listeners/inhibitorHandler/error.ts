import { captureException } from '@sentry/node';
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

  public exec(error: Error, inhibitor: Inhibitor): void {
    captureException(error);
    Logger.error('Oops, something went wrong with an inhibitor!');
    Logger.detail(`Inhibitor: ${inhibitor.id}`);
    Logger.error(error.stack);
  }
}

export default InhibitorHandlerErrorListener;

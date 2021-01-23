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
    Logger.error('Oops, something went wrong with the Swan Client!');
    if (process.env.NODE_ENV === 'production')
      throw new Error(error.stack);
    else
      Logger.error(error.stack);
  }
}

export default ClientErrorListener;

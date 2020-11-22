import { Listener } from 'discord-akairo';
import Logger from '../../structures/Logger';

class UnhandledRejectionListener extends Listener {
  constructor() {
    super('unhandledRejection', {
      event: 'unhandledRejection',
      emitter: 'process',
    });
  }

  exec(error) {
    Logger.error('Oops, something went wrong with Swan! (unhandledRejection)');
    if (process.env.NODE_ENV === 'production')
      throw new Error(error.stack);
    else
      Logger.error(error.stack);
  }
}

export default UnhandledRejectionListener;

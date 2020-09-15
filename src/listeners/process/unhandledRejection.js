import { Listener } from 'discord-akairo';

class UnhandledRejectionListener extends Listener {
  constructor() {
    super('unhandledRejection', {
      event: 'unhandledRejection',
      emitter: 'process',
    });
  }

  exec(error) {
    this.client.logger.error('Oops, something went wrong with Swan! (unhandledRejection)');
    if (process.env.NODE_ENV === 'production')
      throw new Error(error.stack);
    else
      this.client.logger.error(error.stack);
  }
}

export default UnhandledRejectionListener;

import { Listener } from 'discord-akairo';

class ClientErrorListener extends Listener {
  constructor() {
    super('clientError', {
      event: 'error',
      emitter: 'client',
    });
  }

  exec(error) {
    this.client.logger.error('Oops, something went wrong with the Swan Client!');
    if (process.env.NODE_ENV === 'production')
      throw new Error(error.stack);
    else
      this.client.logger.error(error.stack);
  }
}

export default ClientErrorListener;

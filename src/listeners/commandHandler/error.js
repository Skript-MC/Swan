import { Listener } from 'discord-akairo';

class ErrorListener extends Listener {
  constructor() {
    super('error', {
      event: 'error',
      emitter: 'commandHandler',
    });
  }

  exec(error, message, command) {
    this.client.logger.error('Oops, something went wrong with a command!');
    this.client.logger.detail(`Command: ${command}`);
    this.client.logger.detail(`Message: ${message.url}`);
    if (process.env.NODE_ENV === 'production')
      throw new Error(error.stack);
    else
      this.client.logger.error(error.stack);
  }
}

export default ErrorListener;

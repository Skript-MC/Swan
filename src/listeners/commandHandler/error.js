import { Listener } from 'discord-akairo';

class ErrorListener extends Listener {
  constructor() {
    super('error', {
      emitter: 'commandHandler',
      event: 'error',
      category: 'commandHandler',
    });
  }

  exec(error, message, command) {
    this.client.logger.error(`Oops, something went wrong with the command ${command}!`);
    this.client.logger.detail(`Message that triggered the command: ${message.url}`);
    if (process.env.NODE_ENV === 'production')
      throw new Error(error);
    else
      this.client.logger.error(error);
  }
}

export default ErrorListener;

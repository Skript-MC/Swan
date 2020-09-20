import { Listener } from 'discord-akairo';
import messages from '../../../config/messages';
import { noop } from '../../utils';

class CommandHandlerErrorListener extends Listener {
  constructor() {
    super('commandHandlerError', {
      event: 'error',
      emitter: 'commandHandler',
    });
  }

  exec(error, message, command) {
    message.util.send(messages.global.oops).catch(noop);
    this.client.logger.error('Oops, something went wrong with a command!');
    this.client.logger.detail(`Command: ${command}`);
    this.client.logger.detail(`Message: ${message.url}`);
    if (process.env.NODE_ENV === 'production')
      throw new Error(error.stack);
    else
      this.client.logger.error(error.stack);
  }
}

export default CommandHandlerErrorListener;

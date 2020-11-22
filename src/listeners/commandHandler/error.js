import { Listener } from 'discord-akairo';
import messages from '../../../config/messages';
import Logger from '../../structures/Logger';
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
    Logger.error('Oops, something went wrong with a command!');
    Logger.detail(`Command: ${command}`);
    Logger.detail(`Message: ${message.url}`);
    if (process.env.NODE_ENV === 'production')
      throw new Error(error.stack);
    else
      Logger.error(error.stack);
  }
}

export default CommandHandlerErrorListener;

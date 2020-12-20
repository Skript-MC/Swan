import messages from '../../config/messages';
import Logger from '../structures/Logger';
import ModerationError from './ModerationError';

class ErrorState {
  constructor(client, channel) {
    this.client = client;
    this.channel = channel;
    this.errors = [];
  }

  addError(error) {
    if (error instanceof ModerationError)
      this.errors.push(error);
  }

  hasError() {
    return Boolean(this.errors.length);
  }

  log() {
    if (!this.hasError())
      return;

    this.channel.send(messages.global.oops);
    for (const error of this.errors) {
      Logger.error(error.message);
      if (error instanceof ModerationError) {
        for (const [detail, value] of error.details.entries())
          Logger.detail(`${detail}: ${value}`);
      }
      Logger.detail(error.stack, true);
    }
  }
}

export default ErrorState;

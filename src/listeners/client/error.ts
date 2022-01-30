import { Listener } from '@sapphire/framework';
import { captureException } from '@sentry/node';

export default class ClientErrorListener extends Listener {
  public override run(error: Error): void {
    captureException(error);
    this.container.logger.error('Oops, something went wrong with the Swan Client!');
    this.container.logger.error(error.stack);
  }
}

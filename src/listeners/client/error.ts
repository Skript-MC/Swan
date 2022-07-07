import { captureException } from '@sentry/node';
import SwanListener from '@/app/structures/SwanListener';

export default class ClientErrorListener extends SwanListener {
  public override run(error: Error): void {
    captureException(error);
    this.container.logger.error('Oops, something went wrong with the Swan Client!');
    this.container.logger.error(error.stack);
  }
}

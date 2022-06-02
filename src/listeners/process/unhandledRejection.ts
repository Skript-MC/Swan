import { ApplyOptions } from '@sapphire/decorators';
import type { ListenerOptions } from '@sapphire/framework';
import { Listener } from '@sapphire/framework';
import { captureException, flush } from '@sentry/node';

@ApplyOptions<ListenerOptions>({ emitter: process })
export default class UnhandledRejectionListener extends Listener {
  public override run(error: Error): void {
    captureException(error);
    void flush(4000);
    this.container.logger.error('Oops, something went wrong with Swan! (unhandledRejection)');
    this.container.logger.error(error.stack);
  }
}

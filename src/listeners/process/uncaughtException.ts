import { ApplyOptions } from '@sapphire/decorators';
import type { ListenerOptions } from '@sapphire/framework';
import { Listener } from '@sapphire/framework';
import { captureException, flush } from '@sentry/node';

@ApplyOptions<ListenerOptions>({ emitter: process })
export default class UncaughtExceptionListener extends Listener {
  public override run(error: Error): void {
    captureException(error);
    void flush(4000);
    this.container.logger.error('Oops, something went wrong with Swan! (uncaughtException)');
    this.container.logger.error(error.stack);
    this.container.logger.warn('An uncaughtException just occurred. Swan is now in an undefined state. Continuing using it might lead to unforeseen and unpredictable issues.');
  }
}

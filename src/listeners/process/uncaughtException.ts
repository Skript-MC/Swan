import { ApplyOptions } from '@sapphire/decorators';
import type { ListenerOptions } from '@sapphire/framework';
import { Listener } from '@sapphire/framework';
import { captureException, flush } from '@sentry/node';
import { miscellaneous } from '@/conf/settings';

@ApplyOptions<ListenerOptions>({ emitter: process })
export class UncaughtExceptionListener extends Listener {
  public override async run(error: Error): Promise<void> {
    captureException(error);
    this.container.logger.error('Oops, something went wrong with Swan! (uncaughtException)');
    this.container.logger.error(error.stack);
    this.container.logger.warn('An uncaughtException just occurred. Swan is now in an undefined state. Continuing using it might lead to unforeseen and unpredictable issues.');
    await flush(miscellaneous.sentryFlush);
  }
}

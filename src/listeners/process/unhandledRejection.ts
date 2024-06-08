import { ApplyOptions } from '@sapphire/decorators';
import type { ListenerOptions } from '@sapphire/framework';
import { Listener } from '@sapphire/framework';
import { captureException, flush } from '@sentry/node';
import { miscellaneous } from '#config/settings';

@ApplyOptions<ListenerOptions>({ emitter: process })
export class UnhandledRejectionListener extends Listener {
  public override async run(error: Error): Promise<void> {
    captureException(error);
    this.container.logger.error('Oops, something went wrong with Swan! (unhandledRejection)');
    this.container.logger.error(error.stack);
    await flush(miscellaneous.sentryFlush);
  }
}

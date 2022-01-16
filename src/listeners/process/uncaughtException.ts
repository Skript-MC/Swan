import { ApplyOptions } from '@sapphire/decorators';
import type { ListenerOptions } from '@sapphire/framework';
import { Listener } from '@sapphire/framework';

@ApplyOptions<ListenerOptions>({ emitter: process })
export default class UncaughtExceptionListener extends Listener {
  public override run(error: Error): void {
    this.container.logger.error('Oops, something went wrong with Swan! (uncaughtException)');
    if (process.env.NODE_ENV === 'production') {
      throw new Error(error.stack);
    } else {
      this.container.logger.error(error.stack);
      this.container.logger.warn('An uncaughtException just occurred. Swan is now in an undefined state. Continuing using it might lead to unforeseen and unpredictable issues.');
    }
  }
}

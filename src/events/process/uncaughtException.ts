import { ApplyOptions } from '@sapphire/decorators';
import type { EventOptions } from '@sapphire/framework';
import { Event } from '@sapphire/framework';

@ApplyOptions<EventOptions>({ emitter: process })
export default class UncaughtExceptionEvent extends Event {
  public override run(error: Error): void {
    this.context.logger.error('Oops, something went wrong with Swan! (uncaughtException)');
    if (process.env.NODE_ENV === 'production') {
      throw new Error(error.stack);
    } else {
      this.context.logger.error(error.stack);
      this.context.logger.warn('An uncaughtException just occurred. Swan is now in an undefined state. Continuing using it might lead to unforeseen and unpredictable issues.');
    }
  }
}

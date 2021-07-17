import { ApplyOptions } from '@sapphire/decorators';
import type { EventOptions } from '@sapphire/framework';
import { Event } from '@sapphire/framework';

@ApplyOptions<EventOptions>({ emitter: process })
export default class UnhandledRejectionEvent extends Event {
  public run(error: Error): void {
    this.context.logger.error('Oops, something went wrong with Swan! (unhandledRejection)');
    if (process.env.NODE_ENV === 'production')
      throw new Error(error.stack);
    else
      this.context.logger.error(error.stack);
  }
}

import type { EventErrorPayload } from '@sapphire/framework';
import { Event } from '@sapphire/framework';

export default class EventErrorEvent extends Event {
  public override run(error: Error, { piece: event }: EventErrorPayload): void {
    this.context.logger.error('Oops, something went wrong with a listener!');
    this.context.logger.info(`Event: ${event.name}`);
    if (process.env.NODE_ENV === 'production')
      throw new Error(error.stack);
    else
      this.context.logger.error(error.stack);
  }
}

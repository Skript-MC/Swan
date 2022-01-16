import type { ListenerErrorPayload } from '@sapphire/framework';
import { Listener } from '@sapphire/framework';

export default class ListenerErrorListener extends Listener {
  public override run(error: Error, { piece: event }: ListenerErrorPayload): void {
    this.container.logger.error('Oops, something went wrong with a listener!');
    this.container.logger.info(`Event: ${event.name}`);
    if (process.env.NODE_ENV === 'production')
      throw new Error(error.stack);
    else
      this.container.logger.error(error.stack);
  }
}

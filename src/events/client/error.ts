import { Event } from '@sapphire/framework';

export default class ClientErrorEvent extends Event {
  public override run(error: Error): void {
    this.context.logger.error('Oops, something went wrong with the Swan Client!');
    if (process.env.NODE_ENV === 'production')
      throw new Error(error.stack);
    else
      this.context.logger.error(error.stack);
  }
}

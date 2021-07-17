import { ApplyOptions } from '@sapphire/decorators';
import type { EventOptions } from '@sapphire/framework';
import { Event } from '@sapphire/framework';
import mongoose from 'mongoose';

@ApplyOptions<EventOptions>({ emitter: mongoose.connection })
export default class MongodbErrorEvent extends Event {
  public run(error: Error): void {
    this.context.logger.error('Oops, something went wrong with MongoDB!');
    this.context.logger.info('Please make sure MongoDB is running.');
    if (process.env.NODE_ENV === 'production')
      throw new Error(error.stack);
    else
      this.context.logger.error(error.stack);
  }
}

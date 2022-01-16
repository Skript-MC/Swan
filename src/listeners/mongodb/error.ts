import { ApplyOptions } from '@sapphire/decorators';
import type { ListenerOptions } from '@sapphire/framework';
import { Listener } from '@sapphire/framework';
import mongoose from 'mongoose';

@ApplyOptions<ListenerOptions>({ emitter: mongoose.connection })
export default class MongodbErrorListener extends Listener {
  public override run(error: Error): void {
    this.container.logger.error('Oops, something went wrong with MongoDB!');
    this.container.logger.info('Please make sure MongoDB is running.');
    if (process.env.NODE_ENV === 'production')
      throw new Error(error.stack);
    else
      this.container.logger.error(error.stack);
  }
}

import { ApplyOptions } from '@sapphire/decorators';
import type { ListenerOptions } from '@sapphire/framework';
import { Listener } from '@sapphire/framework';
import { captureException } from '@sentry/node';
import mongoose from 'mongoose';

@ApplyOptions<ListenerOptions>({ emitter: mongoose.connection })
export default class MongodbErrorListener extends Listener {
  public override run(error: Error): void {
    captureException(error);
    this.container.logger.error('Oops, something went wrong with MongoDB!');
    this.container.logger.info('Please make sure MongoDB is running.');
    this.container.logger.error(error.stack);
  }
}

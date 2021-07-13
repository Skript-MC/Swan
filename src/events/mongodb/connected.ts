import { ApplyOptions } from '@sapphire/decorators';
import type { EventOptions } from '@sapphire/framework';
import { Event } from '@sapphire/framework';
import mongoose from 'mongoose';

@ApplyOptions<EventOptions>({ emitter: mongoose.connection })
export default class MongodbConnectedEvent extends Event {
  public run(): void {
    this.context.logger.info('MongoDB is connected!');
  }
}

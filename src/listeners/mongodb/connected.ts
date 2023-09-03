import { ApplyOptions } from '@sapphire/decorators';
import type { ListenerOptions } from '@sapphire/framework';
import { Listener } from '@sapphire/framework';
import mongoose from 'mongoose';

@ApplyOptions<ListenerOptions>({ emitter: mongoose.connection })
export class MongodbConnectedListener extends Listener {
  public override run(): void {
    this.container.logger.info('MongoDB is connected!');
  }
}

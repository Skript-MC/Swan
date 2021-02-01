import { Listener } from 'discord-akairo';
import Logger from '@/app/structures/Logger';

class MongodbConnectedListener extends Listener {
  constructor() {
    super('mongodbConnected', {
      event: 'connected',
      emitter: 'mongodb',
    });
  }

  public exec(): void {
    Logger.success('MongoDB is connected!');
  }
}

export default MongodbConnectedListener;

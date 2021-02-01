import { Listener } from 'discord-akairo';
import Logger from '@/app/structures/Logger';

class MongodbErrorListener extends Listener {
  constructor() {
    super('mongodbError', {
      event: 'error',
      emitter: 'mongodb',
    });
  }

  public exec(error: Error): void {
    Logger.error('Oops, something went wrong with MongoDB!');
    Logger.detail('Please make sure MongoDB is running.');
    if (process.env.NODE_ENV === 'production')
      throw new Error(error.stack);
    else
      Logger.error(error.stack);
  }
}

export default MongodbErrorListener;

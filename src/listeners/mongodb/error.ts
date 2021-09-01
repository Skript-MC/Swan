import { captureException } from '@sentry/node';
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
    captureException(error);
    Logger.error('Oops, something went wrong with MongoDB!');
    Logger.detail('Please make sure MongoDB is running.');
    Logger.error(error.stack);
  }
}

export default MongodbErrorListener;

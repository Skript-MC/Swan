import { captureException, flush } from '@sentry/node';
import { Listener } from 'discord-akairo';
import Logger from '@/app/structures/Logger';

class MongodbErrorListener extends Listener {
  constructor() {
    super('mongodbError', {
      event: 'error',
      emitter: 'mongodb',
    });
  }

  public async exec(error: Error): Promise<void> {
    Logger.error('Oops, something went wrong with MongoDB!');
    Logger.detail('Please make sure MongoDB is running.');
    if (process.env.NODE_ENV === 'production') {
      captureException(error);
      await flush(5000);
      // eslint-disable-next-line node/no-process-exit
      process.exit(1);
    } else {
      Logger.error(error.stack);
    }
  }
}

export default MongodbErrorListener;

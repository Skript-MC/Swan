import { Listener } from 'discord-akairo';
import Logger from '@/app/structures/Logger';

class RedisErrorListener extends Listener {
  constructor() {
    super('redisError', {
      event: 'error',
      emitter: 'redis',
    });
  }

  public exec(error: Error): void {
    Logger.error('Oops, something went wrong with Redis!');
    if (process.env.NODE_ENV === 'production')
      throw new Error(error.stack);
    else
      Logger.error(error.stack);
  }
}

export default RedisErrorListener;

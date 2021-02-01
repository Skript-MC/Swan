import { Listener } from 'discord-akairo';
import Logger from '@/app/structures/Logger';

class RedisConnectListener extends Listener {
  constructor() {
    super('connect', {
      event: 'connect',
      emitter: 'redis',
    });
  }

  public exec(): void {
    Logger.success('Redis is connected!');
  }
}

export default RedisConnectListener;

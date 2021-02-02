import { Listener } from 'discord-akairo';
import type { AkairoHandler } from 'discord-akairo';
import ow from 'ow';
import Logger from '@/app/structures/Logger';
import type { SwanModuleBase } from '@/app/types/index';

class RedisMessageListener extends Listener {
  constructor() {
    super('redisMessage', {
      event: 'message',
      emitter: 'redis',
    });
  }

  public exec(channel: string, message: string): void {
    let parsedMessage: Record<string, unknown>;
    try {
      parsedMessage = JSON.parse(message);
    } catch {
      Logger.warn('Received malformed message through Redis.');
      Logger.detail(`Redis channel: ${channel}`);
      Logger.detail(`Redis message: ${message}`);
      return;
    }

    switch (channel) {
      case 'module':
        try {
          ow(parsedMessage, ow.object.exactShape({
            name: ow.string,
            handler: ow.string.oneOf(['commandHandler', 'listenerHandler', 'inhibitorHandler', 'taskHandler']),
            enabled: ow.boolean,
          }));
        } catch (unknownError: unknown) {
          Logger.warn('Received invalid message through Redis.');
          Logger.detail(`Error: ${(unknownError as Error).message}`);
          Logger.detail('Redis channel: module');
          Logger.detail(`Redis message: ${JSON.stringify(parsedMessage)}`);
          return;
        }

        this._handleModuleChange(parsedMessage);
        break;

      default:
        Logger.warn('Received message from unknown channel');
        Logger.detail(`Redis channel: ${channel}`);
        Logger.detail(`Redis message: ${JSON.stringify(parsedMessage)}`);
        break;
    }
  }

  private _handleModuleChange(message: SwanModuleBase): void {
    const handler: AkairoHandler = this.client[message.handler];
    if (handler) {
      if (message.enabled)
        handler.load(this.client.modules.find(mod => mod.id === message.name).filepath);
      else
        handler.remove(message.name);
    }
  }
}

export default RedisMessageListener;

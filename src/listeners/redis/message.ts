import path from 'path';
import type { AkairoModule } from 'discord-akairo';
import { AkairoHandler, Listener } from 'discord-akairo';
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
      Logger.detail(`Channel: ${channel}`);
      Logger.detail(`Message: ${message}`);
      return;
    }

    switch (channel) {
      case 'module':
        if (!('name' in parsedMessage) || !('handler' in parsedMessage) || !('enabled' in parsedMessage)) {
          Logger.warn('Received invalid message through Redis.');
          Logger.detail('Required: "name", "handler", "enabled"');
          Logger.detail('Redis channel: module');
          Logger.detail(`Redis message: ${JSON.stringify(parsedMessage)}`);
          return;
        }

        // https://github.com/microsoft/TypeScript/issues/15300
        this._handleModuleChange(parsedMessage as unknown as SwanModuleBase);
        break;
      default:
        Logger.warn('Received message from unknown channel');
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

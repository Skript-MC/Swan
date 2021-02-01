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
          Logger.detail('Required: "name", "enabled"');
          Logger.detail('Channel: module');
          Logger.detail(`Message: ${JSON.stringify(parsedMessage)}`);
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

  private _loadModuleWithId(id: string, handler: AkairoHandler): void {
    // TODO: Improve this method's code, and add typings.

    // Code to resolve the module adapted from https://github.com/discord-akairo/discord-akairo/blob/29810b9e5d5cd804c649948ad60e5f2ac3897141/src/struct/AkairoHandler.js#L118
    const filepaths = AkairoHandler.readdirRecursive(handler.directory);
    for (let filepath of filepaths) {
      filepath = path.resolve(filepath);

      if (!handler.extensions.has(path.extname(filepath)))
        continue;

      // I have no clue of what type this is. Again, this code is borrowed from Akairo's core.
      let Module = function findExport(module): AkairoModule | null {
        if (!module)
          return null;
        if (module.prototype instanceof handler.classToHandle)
          return module;
        return module.default ? findExport.call(handler, module.default) : null;
      }.call(handler, require(filepath));

      if (Module && Module.prototype instanceof handler.classToHandle)
        Module = new Module(handler);

      if (Module.id === id) {
        handler.load(filepath);
        break;
      } else {
        // eslint-disable-next-line @typescript-eslint/no-dynamic-delete
        delete require.cache[require.resolve(filepath)];
      }
    }
  }

  private _handleModuleChange(message: SwanModuleBase): void {
    const handler: AkairoHandler = this.client[message.handler];
    if (handler) {
      // When the module is disabled, it is not loaded so not in handler.modules. Hence we have to resolve it by hand.
      if (message.enabled)
        this._loadModuleWithId(message.name, handler);
      else
        handler.remove(message.name);
    }
  }
}

export default RedisMessageListener;

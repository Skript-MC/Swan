import type { AkairoHandler } from 'discord-akairo';
import { Command } from 'discord-akairo';
import SwanModule from '@/app/models/swanModule';
import type { GuildMessage } from '@/app/types';
import type { RefreshCommandArgument } from '@/app/types/CommandArguments';
import { refresh as config } from '@/conf/commands/admin';

class RefreshCommand extends Command {
  constructor() {
    super('refresh', {
      aliases: config.settings.aliases,
      details: config.details,
      clientPermissions: config.settings.clientPermissions,
      userPermissions: config.settings.userPermissions,
      channel: 'guild',
    });
  }

  public async exec(message: GuildMessage, _args: RefreshCommandArgument): Promise<void> {
    const modules = await SwanModule.find();

    for (const module of modules) {
      const handler: AkairoHandler = this.client[module.handler];
      const cachedModule = this.client.cache.modules.find(mod => mod.id === module.name);
      if (!cachedModule)
        continue;
      // See if the module is present in handler.modules (= if it is loaded).x
      const currentState = Boolean(handler.modules.findKey((_, key) => key === cachedModule.id));

      if (handler && module.enabled !== currentState) {
        if (module.enabled)
          handler.load(cachedModule.filepath);
        else
          handler.remove(module.name);
      }
    }

    await message.channel.send(config.messages.success);
  }
}

export default RefreshCommand;

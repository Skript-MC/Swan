import type { AkairoHandler } from 'discord-akairo';
import { Command } from 'discord-akairo';
import sharedConfig from '@/app/models/sharedConfig';
import SwanModule from '@/app/models/swanModule';
import type { GuildMessage, SharedConfigDocument } from '@/app/types';
import { SharedConfigName } from '@/app/types';
import type { RefreshCommandArgument } from '@/app/types/CommandArguments';
import { nullop } from '@/app/utils';
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
    // Refresh modules
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

    // Refresh saved channels
    const configDocument: SharedConfigDocument = await sharedConfig.findOne({
      name: SharedConfigName.LoggedChannels,
    }).catch(nullop);
    this.client.cache.savedChannelsIds = configDocument?.value as string[];

    await message.channel.send(config.messages.success);
  }
}

export default RefreshCommand;

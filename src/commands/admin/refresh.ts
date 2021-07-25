import { Command } from 'discord-akairo';
import SharedConfig from '@/app/models/sharedConfig';
import SwanModule from '@/app/models/swanModule';
import type { GuildMessage } from '@/app/types';
import { SharedConfigName } from '@/app/types';
import type { RefreshCommandArgument } from '@/app/types/CommandArguments';
import { nullop, toggleModule } from '@/app/utils';
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
    for (const module of modules)
      toggleModule(this.client, module, module.enabled);

    // Refresh saved channels
    const configDocument = await SharedConfig.findOne({
      name: SharedConfigName.LoggedChannels,
    }).catch(nullop);
    this.client.cache.savedChannelsIds = configDocument?.value as string[];

    await message.channel.send(config.messages.success);
  }
}

export default RefreshCommand;

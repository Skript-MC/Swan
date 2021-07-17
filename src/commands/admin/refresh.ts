import { ApplyOptions } from '@sapphire/decorators';
import type { Args } from '@sapphire/framework';
import SharedConfig from '@/app/models/sharedConfig';
import SwanModule from '@/app/models/swanModule';
import SwanCommand from '@/app/structures/commands/SwanCommand';
import type { GuildMessage, SwanCommandOptions } from '@/app/types';
import { SharedConfigName } from '@/app/types';
import { nullop, toggleModule } from '@/app/utils';
import { refresh as config } from '@/conf/commands/admin';
import settings from '@/conf/settings';

@ApplyOptions<SwanCommandOptions>({ ...settings.globalCommandsOptions, ...config.settings })
export default class RefreshCommand extends SwanCommand {
  public async run(message: GuildMessage, _args: Args): Promise<void> {
    // Refresh modules
    const modules = await SwanModule.find();
    for (const module of modules)
      await toggleModule(module, module.enabled);

    // Refresh saved channels
    const configDocument = await SharedConfig.findOne({
      name: SharedConfigName.LoggedChannels,
    }).catch(nullop);
    this.context.client.cache.savedChannelsIds = configDocument?.value as string[];

    await message.channel.send(config.messages.success);
  }
}

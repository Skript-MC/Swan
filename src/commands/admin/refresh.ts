import { ApplyOptions } from '@sapphire/decorators';
import SwanChannel from '@/app/models/swanChannel';
import SwanModule from '@/app/models/swanModule';
import SwanCommand from '@/app/structures/commands/SwanCommand';
import type { GuildMessage, SwanCommandOptions } from '@/app/types';
import type { RefreshCommandArgument } from '@/app/types/CommandArguments';
import { toggleModule } from '@/app/utils';
import { refresh as config } from '@/conf/commands/admin';
import settings from '@/conf/settings';

@ApplyOptions<SwanCommandOptions>({ ...settings.globalCommandsOptions, ...config.settings })
export default class RefreshCommand extends SwanCommand {
  public override async messageRun(message: GuildMessage, _args: RefreshCommandArgument): Promise<void> {
    // Refresh modules
    const modules = await SwanModule.find();
    for (const module of modules)
      await toggleModule(module, module.enabled);

    this.container.client.cache.swanChannels = new Set();
    for (const channel of this.container.client.guild.channels.cache.values()) {
      if (!channel.isText())
        continue;
      const swanChannel = await SwanChannel.findOneOrCreate({
        channelId: channel.id,
      }, {
        channelId: channel.id,
        categoryId: channel.parentId,
        name: channel.name,
        logged: false,
      });
      if (swanChannel.logged)
        this.container.client.cache.swanChannels.add(swanChannel);
    }

    await message.channel.send(config.messages.success);
  }
}

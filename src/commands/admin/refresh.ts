import { Command } from 'discord-akairo';
import type { GuildChannel } from 'discord.js';
import SwanChannel from '@/app/models/swanChannel';
import SwanModule from '@/app/models/swanModule';
import type { GuildMessage } from '@/app/types';
import type { RefreshCommandArgument } from '@/app/types/CommandArguments';
import { toggleModule } from '@/app/utils';
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

    this.client.cache.swanChannels = new Set();
    for (const channel of this.client.guild.channels.cache.array()) {
      if (!channel.isText())
        continue;
      const guildChannel = channel as GuildChannel;
      const swanChannel = await SwanChannel.findOneOrCreate({
        channelId: guildChannel.id,
      }, {
        channelId: guildChannel.id,
        categoryId: guildChannel.parentID,
        name: guildChannel.name,
        logged: false,
      });
      if (swanChannel.logged)
        this.client.cache.swanChannels.add(swanChannel);
    }

    await message.channel.send(config.messages.success);
  }
}

export default RefreshCommand;

import { ApplyOptions } from '@sapphire/decorators';
import type { ChatInputCommand } from '@sapphire/framework';
import type { Awaitable } from '@sapphire/utilities';
import type { ApplicationCommandOptionData, CommandInteraction } from 'discord.js';
import SwanChannel from '@/app/models/swanChannel';
import SwanModule from '@/app/models/swanModule';
import SwanCommand from '@/app/structures/commands/SwanCommand';
import type { SwanCommandOptions } from '@/app/types';
import { toggleModule } from '@/app/utils';
import { refresh as config } from '@/conf/commands/admin';
import settings from '@/conf/settings';

@ApplyOptions<SwanCommandOptions>({ ...settings.globalCommandsOptions, ...config.settings })
export default class RefreshCommand extends SwanCommand {
  public getOptions(): Awaitable<ApplicationCommandOptionData[]> {
    return [];
  }

  public override async chatInputRun(
    interaction: CommandInteraction,
    _context: ChatInputCommand.RunContext,
  ): Promise<void> {
    console.log(interaction);
    await this._exec(interaction);
  }

  private async _exec(interaction: CommandInteraction): Promise<void> {
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

    await interaction.reply(config.messages.success);
  }
}

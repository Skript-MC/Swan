import type { ChatInputCommand } from '@sapphire/framework';
import type { ApplicationCommandOptionData, CommandInteraction } from 'discord.js';
import { ApplicationCommandOptionTypes } from 'discord.js/typings/enums';
import type SwanClient from '@/app/SwanClient';
import ApplySwanOptions from '@/app/decorators/swanOptions';
import SwanChannel from '@/app/models/swanChannel';
import SwanModule from '@/app/models/swanModule';
import SwanCommand from '@/app/structures/commands/SwanCommand';
import { toggleModule } from '@/app/utils';
import { refresh as config } from '@/conf/commands/admin';

@ApplySwanOptions(config)
export default class RefreshCommand extends SwanCommand {
  public static commandOptions: ApplicationCommandOptionData[] = [
    {
      type: ApplicationCommandOptionTypes.STRING,
      choices: [
        {
          name: 'Modules',
          value: 'modules',
        },
        {
          name: 'Salons à sauvegarder',
          value: 'loggedChannels',
        },
        {
          name: 'Addons',
          value: 'addons',
        },
        {
          name: 'Documentation',
          value: 'docs',
        },
      ],
      name: 'catégorie',
      description: 'Catégorie à rafraîchir',
      required: true,
    },
  ];

  public override async chatInputRun(
    interaction: CommandInteraction,
    _context: ChatInputCommand.RunContext,
  ): Promise<void> {
    await this._exec(interaction, interaction.options.getString('catégorie'));
  }

  private async _exec(interaction: CommandInteraction, category: string): Promise<void> {
    switch (category) {
      case 'modules': {
        const swanModules = await SwanModule.find();
        for (const module of swanModules)
          await toggleModule(module, module.enabled);
        break;
      }
      case 'loggedChannels':
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
        break;
      case 'addons': {
        this.container.client.cache.addonsVersions = [];
        const client = this.container.client as SwanClient;
        await client.loadSkriptToolsAddons();
        break;
      }
      case 'docs': {
        this.container.client.cache.skriptMcSyntaxes = [];
        const client = this.container.client as SwanClient;
        await client.loadSkriptMcSyntaxes();
        break;
      }
    }

    await interaction.reply(config.messages.success);
  }
}

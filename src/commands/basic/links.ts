import { ApplyOptions } from '@sapphire/decorators';
import type { Args } from '@sapphire/framework';
import { MessageEmbed } from 'discord.js';
import pupa from 'pupa';
import PaginatedMessageEmbedFields from '@/app/structures/PaginatedMessageEmbedFields';
import SwanCommand from '@/app/structures/commands/SwanCommand';
import type { GuildMessage, SwanCommandOptions } from '@/app/types';
import { links as config } from '@/conf/commands/basic';
import settings from '@/conf/settings';

@ApplyOptions<SwanCommandOptions>({ ...settings.globalCommandsOptions, ...config.settings })
export default class LinksCommand extends SwanCommand {
  public override async messageRun(message: GuildMessage, _args: Args): Promise<void> {
    await this._exec(message);
  }

  private async _exec(message: GuildMessage): Promise<void> {
    await new PaginatedMessageEmbedFields()
      .setTemplate(new MessageEmbed().setColor(settings.colors.default))
      .setItems(config.messages.embed.fields)
      .setItemsPerPage(2)
      .setSelectMenuOptions(pageIndex => ({
        label: config.messages.embed.summary[pageIndex - 1],
        description: pupa(config.messages.selectMenuItemDescription, { pageIndex }),
      }))
      .make()
      .run(message, message.author);
  }
}

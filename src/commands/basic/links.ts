import { ApplyOptions } from '@sapphire/decorators';
import { MessageEmbed } from 'discord.js';
import pupa from 'pupa';
import PaginatedMessageEmbedFields from '@/app/structures/PaginatedMessageEmbedFields';
import SwanCommand from '@/app/structures/commands/SwanCommand';
import type { GuildMessage, SwanCommandOptions } from '@/app/types';
import type { LinksCommandArguments } from '@/app/types/CommandArguments';
import { links as config } from '@/conf/commands/basic';
import settings from '@/conf/settings';

@ApplyOptions<SwanCommandOptions>({ ...settings.globalCommandsOptions, ...config.settings })
export default class LinksCommand extends SwanCommand {
  public override async messageRun(message: GuildMessage, _args: LinksCommandArguments): Promise<void> {
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

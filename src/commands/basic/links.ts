import type { ChatInputCommand } from '@sapphire/framework';
import type { CommandInteraction } from 'discord.js';
import { Message, MessageEmbed } from 'discord.js';
import pupa from 'pupa';
import ApplySwanOptions from '@/app/decorators/swanOptions';
import PaginatedMessageEmbedFields from '@/app/structures/PaginatedMessageEmbedFields';
import SwanCommand from '@/app/structures/commands/SwanCommand';
import { links as config } from '@/conf/commands/basic';
import settings from '@/conf/settings';

@ApplySwanOptions(config)
export default class LinksCommand extends SwanCommand {

  public override async chatInputRun(
    interaction: CommandInteraction,
    _context: ChatInputCommand.RunContext,
  ): Promise<void> {
    await this._exec(interaction);
  }

  private async _exec(interaction: CommandInteraction): Promise<void> {
    const defer = await interaction.deferReply({ fetchReply: true });
    if (!(defer instanceof Message))
      return;
    const user = await this.container.client.users.fetch(interaction.member.user.id);
    await new PaginatedMessageEmbedFields()
      .setTemplate(new MessageEmbed().setColor(settings.colors.default))
      .setItems(config.messages.embed.fields)
      .setItemsPerPage(2)
      .setSelectMenuOptions(pageIndex => ({
        label: config.messages.embed.summary[pageIndex - 1],
        description: pupa(config.messages.selectMenuItemDescription, { pageIndex }),
      }))
      .make()
      .run(defer, user);
    await interaction.followUp({});
  }
}

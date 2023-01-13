import type { ChatInputCommand } from '@sapphire/framework';
import { EmbedBuilder } from 'discord.js';
import pupa from 'pupa';
import ApplySwanOptions from '@/app/decorators/swanOptions';
import PaginatedMessageEmbedFields from '@/app/structures/PaginatedMessageEmbedFields';
import { SwanCommand } from '@/app/structures/commands/SwanCommand';
import { links as config } from '@/conf/commands/basic';
import settings from '@/conf/settings';

@ApplySwanOptions(config)
export default class LinksCommand extends SwanCommand {
  public override async chatInputRun(
    interaction: SwanCommand.ChatInputInteraction,
    _context: ChatInputCommand.RunContext,
  ): Promise<void> {
    await this._exec(interaction);
  }

  private async _exec(interaction: SwanCommand.ChatInputInteraction): Promise<void> {
    const user = await this.container.client.users.fetch(interaction.member.user.id);
    await new PaginatedMessageEmbedFields()
      .setTemplate(new EmbedBuilder().setColor(settings.colors.default))
      .setItems(config.messages.embed.fields)
      .setItemsPerPage(2)
      .setSelectMenuOptions(pageIndex => ({
        label: config.messages.embed.summary[pageIndex - 1],
        description: pupa(config.messages.selectMenuItemDescription, { pageIndex }),
      }))
      .make()
      .run(interaction, user);
  }
}

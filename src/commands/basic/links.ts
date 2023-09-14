import { ApplyOptions } from '@sapphire/decorators';
import type { ChatInputCommand } from '@sapphire/framework';
import type { ApplicationCommandOptionData } from 'discord.js';
import { ApplicationCommandType, EmbedBuilder } from 'discord.js';
import pupa from 'pupa';
import { links as config } from '#config/commands/basic';
import { colors } from '#config/settings';
import { PaginatedMessageEmbedFields } from '#structures/PaginatedMessageEmbedFields';
import { SwanCommand } from '#structures/commands/SwanCommand';

@ApplyOptions<SwanCommand.Options>(config.settings)
export class LinksCommand extends SwanCommand {
  override canRunInDM = true;
  commandType = ApplicationCommandType.ChatInput;
  commandOptions: ApplicationCommandOptionData[] = [];

  public override async chatInputRun(
    interaction: SwanCommand.ChatInputInteraction,
    _context: ChatInputCommand.RunContext,
  ): Promise<void> {
    await this._exec(interaction);
  }

  private async _exec(interaction: SwanCommand.ChatInputInteraction): Promise<void> {
    const user = await this.container.client.users.fetch(interaction.member.user.id);
    await new PaginatedMessageEmbedFields()
      .setTemplate(new EmbedBuilder().setColor(colors.default))
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

import { ApplyOptions } from '@sapphire/decorators';
import type { ChatInputCommand } from '@sapphire/framework';
import type { ApplicationCommandOptionData, User } from 'discord.js';
import { ApplicationCommandOptionType, ApplicationCommandType } from 'discord.js';
import pupa from 'pupa';
import { purge as config } from '#config/commands/moderation';
import * as messages from '#config/messages';
import { moderation, roles } from '#config/settings';
import { SwanCommand } from '#structures/commands/SwanCommand';

@ApplyOptions<SwanCommand.Options>(config.settings)
export class PurgeCommand extends SwanCommand {
  commandType = ApplicationCommandType.ChatInput;
  commandOptions: ApplicationCommandOptionData[] = [
    {
      type: ApplicationCommandOptionType.Number,
      name: 'nombre',
      description: 'Nombre de messages à supprimer',
      required: true,
    },
    {
      type: ApplicationCommandOptionType.User,
      name: 'membre',
      description: 'Supprimer les messages du membre en question',
      required: false,
    },
    {
      type: ApplicationCommandOptionType.Boolean,
      name: 'force',
      description: 'Forcer la suppression des messages',
      required: false,
    },
  ];

  public override async chatInputRun(
    interaction: SwanCommand.ChatInputInteraction<'cached'>,
    _context: ChatInputCommand.RunContext,
  ): Promise<void> {
    const amount = interaction.options.getNumber('nombre', true);
    if (!amount || amount < 0 || amount > moderation.purgeLimit) {
      await interaction.reply(messages.prompt.number);
      return;
    }

    await this._exec(
      interaction,
      amount,
      interaction.options.getBoolean('force'),
      interaction.options.getUser('membre'),
    );
  }

  private async _exec(
    interaction: SwanCommand.ChatInputInteraction<'cached'>,
    amount: number,
    force: boolean | null | undefined = false,
    member: User | null | undefined = null,
  ): Promise<void> {
    const channel = interaction.channel ?? (await this.container.client.channels.fetch(interaction.channelId));
    if (!channel || !channel.isTextBased() || channel.isDMBased()) return;

    // Fetch all the requested messages and filter out unwanted ones (from staff or not from the targeted user).
    const allMessages = await channel.messages.fetch({ limit: amount });
    const msgs = allMessages
      .filter((msg) => (member ? msg.author.id === member.id : true))
      .filter((msg) => force || !msg.member?.roles.cache.has(roles.staff));
    const deletedMessages = await channel.bulkDelete(msgs, true);

    await interaction.reply(pupa(config.messages.success, { deletedMessages }));
  }
}

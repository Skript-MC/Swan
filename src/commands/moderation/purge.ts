import type { ChatInputCommand } from '@sapphire/framework';
import type { ApplicationCommandOptionData, CommandInteraction, User } from 'discord.js';
import { TextChannel } from 'discord.js';
import { ApplicationCommandOptionTypes } from 'discord.js/typings/enums';
import pupa from 'pupa';
import ApplySwanOptions from '@/app/decorators/swanOptions';
import SwanCommand from '@/app/structures/commands/SwanCommand';
import { purge as config } from '@/conf/commands/moderation';
import messages from '@/conf/messages';
import settings from '@/conf/settings';

@ApplySwanOptions(config)
export default class PurgeCommand extends SwanCommand {
  public static commandOptions: ApplicationCommandOptionData[] = [
    {
      type: ApplicationCommandOptionTypes.NUMBER,
      name: 'nombre',
      description: 'Nombre de messages à supprimer',
      required: true,
    },
    {
      type: ApplicationCommandOptionTypes.USER,
      name: 'membre',
      description: 'Supprimer les messages du membre en question',
      required: false,
    },
    {
      type: ApplicationCommandOptionTypes.BOOLEAN,
      name: 'force',
      description: 'Forcer la suppression des messages',
      required: false,
    },
  ];

  public override async chatInputRun(
    interaction: CommandInteraction,
    _context: ChatInputCommand.RunContext,
  ): Promise<void> {
    const amount = interaction.options.getNumber('nombre');
    if (!amount || amount < 0 || amount > settings.moderation.purgeLimit) {
      await interaction.reply(messages.prompt.number);
      return;
    }

    await this._exec(
      interaction,
      interaction.options.getBoolean('force'),
      interaction.options.getUser('membre'),
      amount,
    );
  }

  private async _exec(
    interaction: CommandInteraction,
    force: boolean,
    member: User,
    amount: number,
  ): Promise<void> {
    const channel = await this.container.client.channels.fetch(interaction.channel.id);
    if (!(channel instanceof TextChannel))
      return;

    // Fetch all the requested messages and filter out unwanted ones (from staff or not from the targeted user).
    const allMessages = await interaction.channel.messages.fetch({ limit: amount });
    const msgs = allMessages
      .filter(msg => (member ? msg.author.id === member.id : true))
      .filter(msg => (force || !msg.member?.roles.cache.has(settings.roles.staff)));
    const deletedMessages = await channel.bulkDelete(msgs, true);

    await interaction.reply(pupa(config.messages.success, { deletedMessages }));
  }
}

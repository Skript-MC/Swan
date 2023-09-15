import { ApplyOptions } from '@sapphire/decorators';
import type { ChatInputCommand } from '@sapphire/framework';
import { isNullish } from '@sapphire/utilities';
import type { ApplicationCommandOptionData, GuildTextBasedChannel } from 'discord.js';
import { ApplicationCommandOptionType, ApplicationCommandType, ChannelType } from 'discord.js';
import pupa from 'pupa';
import { logs as config } from '#config/commands/admin';
import { SwanChannel } from '#models/swanChannel';
import { SwanCommand } from '#structures/commands/SwanCommand';

@ApplyOptions<SwanCommand.Options>(config.settings)
export class LogsCommand extends SwanCommand {
  override canRunInDM = true;
  commandType = ApplicationCommandType.ChatInput;
  commandOptions: ApplicationCommandOptionData[] = [
    {
      type: ApplicationCommandOptionType.Channel,
      name: 'salon',
      description: 'Salon à modifier le statut de sauvegarde',
      required: true,
      channelTypes: [ChannelType.GuildText],
    },
    {
      type: ApplicationCommandOptionType.Boolean,
      name: 'sauvegarde',
      description: 'Faut-il sauvegarder les messages de ce salon ?',
      required: true,
    },
  ];

  public override async chatInputRun(
    interaction: SwanCommand.ChatInputInteraction,
    _context: ChatInputCommand.RunContext,
  ): Promise<void> {
    const channel = interaction.options.getChannel('salon', true) as GuildTextBasedChannel;
    const logged = interaction.options.getBoolean('sauvegarde', true);
    await this._exec(interaction, channel, logged);
  }

  private async _exec(
    interaction: SwanCommand.ChatInputInteraction,
    channel: GuildTextBasedChannel,
    logged: boolean,
  ): Promise<void> {
    // TODO(interactions): remove second argument, always show the current state for the given channel, and
    // add a toggle to enable/disable logging for the channel.
    const swanChannel = await SwanChannel.findOne({ channelId: channel.id });
    if (!swanChannel) {
      await interaction.reply(config.messages.noChannelFound);
      return;
    }

    if (isNullish(logged)) {
      const result = await SwanChannel.findOne({ channelId: channel.id });
      await interaction.reply(
        pupa(config.messages.loggingStatus, { status: this._getStatus(result?.logged ?? false) }),
      );
      return;
    }

    await SwanChannel.findOneAndUpdate({ channelId: channel.id }, { logged });
    if (swanChannel.logged && !logged)
      this.container.client.cache.swanChannels.delete(swanChannel);
    else
      this.container.client.cache.swanChannels.add(swanChannel);

    await interaction.reply(pupa(config.messages.success, { status: this._getStatus(logged) }));
  }

  private _getStatus(status: boolean): string {
    return status ? config.messages.on : config.messages.off;
  }
}

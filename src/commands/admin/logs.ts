import type { ChatInputCommand } from '@sapphire/framework';
import { isNullish } from '@sapphire/utilities';
import type { ApplicationCommandOptionData, CommandInteraction, GuildTextBasedChannel } from 'discord.js';
import { ApplicationCommandOptionTypes, ChannelTypes } from 'discord.js/typings/enums';
import pupa from 'pupa';
import ApplySwanOptions from '@/app/decorators/swanOptions';
import SwanChannel from '@/app/models/swanChannel';
import SwanCommand from '@/app/structures/commands/SwanCommand';
import { noop } from '@/app/utils';
import { logs as config } from '@/conf/commands/admin';

@ApplySwanOptions(config)
export default class LogsCommand extends SwanCommand {
  public static commandOptions: ApplicationCommandOptionData[] = [
    {
      type: ApplicationCommandOptionTypes.CHANNEL,
      name: 'salon',
      description: 'Salon à modifier le statut de sauvegarde',
      required: true,
      channelTypes: [ChannelTypes.GUILD_TEXT],
    },
    {
      type: ApplicationCommandOptionTypes.BOOLEAN,
      name: 'sauvegarde',
      description: 'Faut-il sauvegarder les messages de ce salon ?',
      required: true,
    },
  ];

  public override async chatInputRun(
    interaction: CommandInteraction,
    _context: ChatInputCommand.RunContext,
  ): Promise<void> {
    const channel = interaction.options.getChannel('salon') as GuildTextBasedChannel;
    const logged = interaction.options.getBoolean('sauvegarde');
    await this._exec(interaction, channel, logged);
  }

  private async _exec(interaction: CommandInteraction, channel: GuildTextBasedChannel, logged: boolean): Promise<void> {
    // TODO(interactions): remove second argument, always show the current state for the given channel, and
    // add a toggle to enable/disable logging for the channel.
    const swanChannel = await SwanChannel.findOne({ channelId: channel.id });
    if (!swanChannel) {
      void interaction.reply(config.messages.noChannelFound).catch(noop);
      return;
    }

    if (isNullish(logged)) {
      const result = await SwanChannel.findOne({ channelId: channel.id });
      void interaction.reply(
        pupa(config.messages.loggingStatus, { status: this._getStatus(result.logged) }),
      );
      return;
    }

    await SwanChannel.findOneAndUpdate({ channelId: channel.id }, { logged });
    if (swanChannel.logged && !logged)
      this.container.client.cache.swanChannels.delete(swanChannel);
    else
      this.container.client.cache.swanChannels.add(swanChannel);

    void interaction.reply(pupa(config.messages.success, { status: this._getStatus(logged) })).catch(noop);
  }

  private _getStatus(status: boolean): string {
    return status ? config.messages.on : config.messages.off;
  }
}

import { ApplyOptions } from '@sapphire/decorators';
import { MessagePrompter } from '@sapphire/discord.js-utilities';
import type { Args } from '@sapphire/framework';
import { isNullish } from '@sapphire/utilities';
import { MessageEmbed } from 'discord.js';
import pupa from 'pupa';
import RefreshCommand from '@/app/commands/admin/refresh';
import SwanModule from '@/app/models/swanModule';
import SwanCommand from '@/app/structures/commands/SwanCommand';
import type { GuildMessage, SwanCommandOptions } from '@/app/types';
import { noop, nullop, toggleModule } from '@/app/utils';
import { module as config } from '@/conf/commands/admin';
import messages from '@/conf/messages';
import settings from '@/conf/settings';

@ApplyOptions<SwanCommandOptions>({ ...settings.globalCommandsOptions, ...config.settings })
export default class ModuleCommand extends SwanCommand {
  public override async messageRun(message: GuildMessage, args: Args): Promise<void> {
    const moduleName = await args.pickResult('string');

    const enabled = await args.pickResult('boolean');

    await this._exec(message, moduleName.value, enabled.value);
  }

  private async _exec(message: GuildMessage, moduleName: string | null, enabled: boolean | null): Promise<void> {
    if (!moduleName) {
      const embed = new MessageEmbed()
        .setTitle(config.messages.embed.title)
        .setURL(config.messages.embed.link)
        .setColor(settings.colors.default)
        .setDescription(config.messages.embed.content)
        .setFooter({ text: pupa(messages.global.executedBy, { member: message.member }) });
      await message.channel.send({ embeds: [embed] }).catch(noop);
      return;
    }

    const module = await SwanModule.findOne({ name: moduleName });
    if (!module) {
      await message.channel.send(config.messages.noModuleFound).catch(noop);
      return;
    }

    if (isNullish(enabled)) {
      await message.channel.send(
        pupa(config.messages.status, { ...module.toJSON(), status: this._getStatus(module.enabled) }),
      );
      return;
    }

    // TODO(interactions): Always show the current state for the given module, and add a toggle to
    // enable/disable it (unless it's the RefreshCommand).
    if (!enabled && module.name === RefreshCommand.name) {
      await message.channel.send(config.messages.cannotBeDisabled).catch(noop);
      return;
    }
    if (!enabled && module.name === this.name) {
      const handler = new MessagePrompter(config.messages.confirmationPrompt, 'confirm', {
        confirmEmoji: settings.emojis.yes,
        cancelEmoji: settings.emojis.no,
        timeout: 2 * 60 * 1000,
      });
      const confirmed = await handler.run(message.channel, message.author).catch(nullop);
      if (!confirmed)
        return;
    }

    await toggleModule(module, enabled);
    await SwanModule.findOneAndUpdate({ name: module.name }, { enabled });

    await message.channel.send(pupa(config.messages.success, { status: this._getStatus(enabled) })).catch(noop);
  }

  private _getStatus(status: boolean): string {
    return status ? config.messages.on : config.messages.off;
  }
}

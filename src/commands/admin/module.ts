import { ApplyOptions } from '@sapphire/decorators';
import { MessagePrompter } from '@sapphire/discord.js-utilities';
import { MessageEmbed } from 'discord.js';
import pupa from 'pupa';
import RefreshCommand from '@/app/commands/admin/refresh';
import Arguments from '@/app/decorators/Argument';
import SwanModule from '@/app/models/swanModule';
import SwanCommand from '@/app/structures/commands/SwanCommand';
import { GuildMessage } from '@/app/types';
import type { SwanCommandOptions } from '@/app/types';
import { ModuleCommandArguments } from '@/app/types/CommandArguments';
import { noop, nullop, toggleModule } from '@/app/utils';
import { module as config } from '@/conf/commands/admin';
import messages from '@/conf/messages';
import settings from '@/conf/settings';

@ApplyOptions<SwanCommandOptions>({ ...settings.globalCommandsOptions, ...config.settings })
export default class ModuleCommand extends SwanCommand {
  @Arguments({
    name: 'moduleName',
    type: 'string',
    match: 'pick',
  }, {
    name: 'enabled',
    type: 'boolean',
    match: 'pick',
  })
  // @ts-expect-error ts(2416)
  public override async messageRun(message: GuildMessage, args: ModuleCommandArguments): Promise<void> {
    if (!args.moduleName) {
      const embed = new MessageEmbed()
        .setTitle(config.messages.embed.title)
        .setURL(config.messages.embed.link)
        .setColor(settings.colors.default)
        .setDescription(config.messages.embed.content)
        .setFooter({ text: pupa(messages.global.executedBy, { member: message.member }) });
      await message.channel.send({ embeds: [embed] }).catch(noop);
      return;
    }

    const modules = await SwanModule.find();
    const module = modules.find(m => m.name === args.moduleName);
    if (!module) {
      await message.channel.send(config.messages.noModuleFound).catch(noop);
      return;
    }

    // TODO(interactions): Always show the current state for the given module, and add a toggle to
    // enable/disable it (unless it's the RefreshCommand).
    if (!args.enabled && module.name === RefreshCommand.name) {
      await message.channel.send(config.messages.cannotBeDisabled).catch(noop);
      return;
    }
    if (!args.enabled && module.name === this.name) {
      const handler = new MessagePrompter(config.messages.confirmationPrompt, 'confirm', {
        confirmEmoji: settings.emojis.yes,
        cancelEmoji: settings.emojis.no,
        timeout: 2 * 60 * 1000,
      });
      const confirmed = await handler.run(message.channel, message.author).catch(nullop);
      if (!confirmed)
        return;
    }

    await toggleModule(module, args.enabled);
    await SwanModule.findOneAndUpdate({ name: module.name }, { enabled: args.enabled });

    await message.channel.send(pupa(config.messages.success, { status: args.enabled ? 'activé' : 'désactivé' })).catch(noop);
  }
}

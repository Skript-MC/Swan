import { ApplyOptions } from '@sapphire/decorators';
import { MessageEmbed } from 'discord.js';
import pupa from 'pupa';
import Arguments from '@/app/decorators/Argument';
import SwanModule from '@/app/models/swanModule';
import SwanCommand from '@/app/structures/commands/SwanCommand';
import { GuildMessage } from '@/app/types';
import type { SwanCommandOptions } from '@/app/types';
import { ModuleCommandArguments } from '@/app/types/CommandArguments';
import { noop, toggleModule } from '@/app/utils';
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
    const modules = await SwanModule.find();

    if (!args.moduleName) {
      const embed = new MessageEmbed()
        .setTitle(config.messages.embed.title)
        .setURL(config.messages.embed.link)
        .setColor(settings.colors.default)
        .setDescription(config.messages.embed.content)
        .setFooter(pupa(messages.global.executedBy, { member: message.member }));
      await message.channel.send({ embeds: [embed] }).catch(noop);
      return;
    }

    const module = modules.find(m => m.name === args.moduleName);
    if (!module) {
      await message.channel.send(config.messages.noModuleFound).catch(noop);
      return;
    }

    await toggleModule(module, args.enabled);
    await SwanModule.findOneAndUpdate({ name: module.name }, { enabled: args.enabled });

    await message.channel.send(pupa(config.messages.success, { status: args.enabled ? 'activé' : 'désactivé' })).catch(noop);
  }
}

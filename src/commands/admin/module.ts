import { ApplyOptions } from '@sapphire/decorators';
import type { Args } from '@sapphire/framework';
import { MessageEmbed } from 'discord.js';
import pupa from 'pupa';
import SwanModule from '@/app/models/swanModule';
import SwanCommand from '@/app/structures/commands/SwanCommand';
import type { GuildMessage, SwanCommandOptions } from '@/app/types';
import { noop, toggleModule } from '@/app/utils';
import { module as config } from '@/conf/commands/admin';
import messages from '@/conf/messages';
import settings from '@/conf/settings';

@ApplyOptions<SwanCommandOptions>({ ...settings.globalCommandsOptions, ...config.settings })
export default class ModuleCommand extends SwanCommand {
  // [{
  //   id: 'moduleName',
  //   type: 'string',
  // }, {
  //   id: 'enabled',
  //   type: 'string',
  // }],

  public async run(message: GuildMessage, args: Args): Promise<void> {
    const modules = await SwanModule.find();
    const moduleName = await args.pickResult('string');

    if (moduleName.error) {
      const embed = new MessageEmbed()
        .setTitle(config.embed.title)
        .setURL(config.embed.link)
        .setColor(settings.colors.default)
        .setDescription(config.embed.content)
        .setFooter(pupa(messages.global.executedBy, { member: message.member }));
      await message.channel.send(embed).catch(noop);
      return;
    }

    const module = modules.find(m => m.name === moduleName.value);
    if (!module)
      return void await message.channel.send(config.messages.noModuleFound).catch(noop);

    const enabled = await args.pickResult('string');
    if (enabled.error || !['on', 'off'].includes(enabled.value))
      return void await message.channel.send(config.messages.invalidStatus).catch(noop);
    const isEnabled = enabled.value === 'on';

    await toggleModule(module, isEnabled);
    await SwanModule.findOneAndUpdate({ name: module.name }, { enabled: isEnabled });

    await message.channel.send(pupa(config.messages.success, { status: isEnabled ? 'activé' : 'désactivé' })).catch(noop);
  }
}

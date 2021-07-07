import { Command } from 'discord-akairo';
import { MessageEmbed } from 'discord.js';
import pupa from 'pupa';
import SwanModule from '@/app/models/swanModule';
import type { GuildMessage } from '@/app/types';
import type { ModuleCommandArguments } from '@/app/types/CommandArguments';
import { noop, toggleModule } from '@/app/utils';
import { module as config } from '@/conf/commands/admin';
import messages from '@/conf/messages';
import settings from '@/conf/settings';

class ModuleCommand extends Command {
  constructor() {
    super('module', {
      aliases: config.settings.aliases,
      details: config.details,
      clientPermissions: config.settings.clientPermissions,
      userPermissions: config.settings.userPermissions,
      channel: 'guild',
      args: [
        {
          id: 'moduleName',
          type: 'string',
        },
        {
          id: 'enabled',
          type: 'string',
        },
      ],
    });
  }

  public async exec(message: GuildMessage, args: ModuleCommandArguments): Promise<void> {
    const modules = await SwanModule.find();

    if (!args.moduleName) {
      const embed = new MessageEmbed()
        .setTitle(config.embed.title)
        .setURL(config.embed.link)
        .setColor(settings.colors.default)
        .setDescription(config.embed.content)
        .setFooter(pupa(messages.global.executedBy, { member: message.member }));
      void message.channel.send(embed).catch(noop);
      return;
    }

    const module = modules.find(m => m.name === args.moduleName);
    if (!module) {
      void message.channel.send(config.messages.noModuleFound).catch(noop);
      return;
    }

    if (!args.enabled) {
      void message.channel.send(pupa(config.messages.noStatus, { module })).catch(noop);
      return;
    }

    const enabled = args.enabled === 'on';

    toggleModule(this.client, module, enabled);
    await SwanModule.findOneAndUpdate({ name: module.name }, { enabled });

    void message.channel.send(pupa(config.messages.success, { status: enabled ? 'activé' : 'désactivé' })).catch(noop);
  }
}

export default ModuleCommand;

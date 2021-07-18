import { ApplyOptions } from '@sapphire/decorators';
import type { Args } from '@sapphire/framework';
import { MessageEmbed } from 'discord.js';
import uniq from 'lodash.uniq';
import pupa from 'pupa';
import SwanCommand from '@/app/structures/commands/SwanCommand';
import type SwanCommandStore from '@/app/structures/commands/SwanCommandStore';
import type { GuildMessage, SwanCommandOptions } from '@/app/types';
import { capitalize } from '@/app/utils';
import { help as config } from '@/conf/commands/basic';
import messages from '@/conf/messages';
import settings from '@/conf/settings';

@ApplyOptions<SwanCommandOptions>({ ...settings.globalCommandsOptions, ...config.settings })
export default class HelpCommand extends SwanCommand {
  // [{
  //   id: 'command',
  //   type: 'commandAlias',
  // }],

  public override async run(message: GuildMessage, args: Args): Promise<void> {
    const command = await args.pickResult('command');
    const { prefix } = settings.bot;

    const embed = new MessageEmbed()
      .setColor(settings.colors.default);

    if (command.success) {
      const information = config.messages.commandInfo;
      embed.setTitle(pupa(information.title, { command: command.value }))
        .addField(information.usage, `\`${prefix}${command.value.usage}\``)
        .addField(information.description, command.value.description)
        .addField(information.usableBy, command.value?.permission ?? messages.global.everyone);

      if (command.value.aliases.length > 1)
        embed.addField(information.aliases, `\`${command.value.aliases.join(`\`${messages.miscellaneous.separator}\``)}\``);
      if (command.value?.examples?.length)
        embed.addField(information.examples, `\`${prefix}${command.value.examples.join(`\`${messages.miscellaneous.separator}\`${prefix}`)}\``);
    } else {
      const information = config.messages.commandsList;
      const commands = (this.context.stores.get('commands') as SwanCommandStore).array();
      const categories = uniq(commands.flatMap(cmd => cmd.category));

      embed.setTitle(pupa(information.title, { amount: commands.length }))
        .setDescription(pupa(information.description, { helpCommand: `${prefix}${this.usage}` }));

      for (const category of categories) {
        embed.addField(
          pupa(information.category, { categoryName: capitalize(category) }),
          commands
            .filter(cmd => cmd.category === category)
            .map(cmd => (this._isAllowed(cmd, message) ? `\`${cmd.aliases[0]}\`` : `~~\`${cmd.aliases[0]}\`~~`))
            .join(messages.miscellaneous.separator),
        );
      }
    }

    await message.channel.send(embed);
  }

  private _isAllowed(_cmd: SwanCommand, _message: GuildMessage): boolean {
    return true;
  }
}

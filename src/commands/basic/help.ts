import { ApplyOptions } from '@sapphire/decorators';
import type { Command } from '@sapphire/framework';
import { MessageEmbed } from 'discord.js';
import pupa from 'pupa';
import Arguments from '@/app/decorators/Argument';
import SwanCommand from '@/app/structures/commands/SwanCommand';
import { GuildMessage } from '@/app/types';
import type { SwanCommandOptions } from '@/app/types';
import { HelpCommandArguments } from '@/app/types/CommandArguments';
import { capitalize } from '@/app/utils';
import { help as config } from '@/conf/commands/basic';
import messages from '@/conf/messages';
import settings from '@/conf/settings';

@ApplyOptions<SwanCommandOptions>({ ...settings.globalCommandsOptions, ...config.settings })
export default class HelpCommand extends SwanCommand {
  @Arguments({
    name: 'command',
    type: 'command',
    match: 'pick',
  })
  // @ts-expect-error ts(2416)
  public override async messageRun(message: GuildMessage, args: HelpCommandArguments): Promise<void> {
    const embed = new MessageEmbed()
      .setColor(settings.colors.default);

    const { command } = args;
    if (command) {
      const information = config.messages.commandInfo;
      embed.setTitle(pupa(information.title, { name: capitalize(command.name) }))
        .addField(information.usage, `\`${settings.bot.prefix}${command.usage}\``)
        .addField(information.description, command.description)
        .addField(information.usableBy, command.permissions.length > 0
          ? command.permissions.join(', ')
          : messages.global.everyone);

      if (command.aliases.length > 1)
        embed.addField(information.aliases, `\`${command.aliases.join(`\`${messages.miscellaneous.separator}\``)}\``);
      if (command.examples.length > 0)
        embed.addField(information.examples, `\`${settings.bot.prefix}${command.examples.join(`\`${messages.miscellaneous.separator}\`${settings.bot.prefix}`)}\``);
    } else {
      const information = config.messages.commandsList;
      const commands = this.container.stores.get('commands');

      embed.setTitle(pupa(information.title, { amount: commands.size }))
        .setDescription(pupa(information.description, { helpCommand: `${settings.bot.prefix}${this.usage}` }));

      for (const category of commands.categories) {
        embed.addField(
          pupa(information.category, { categoryName: capitalize(category) }),
          commands
            .filter(cmd => cmd.category === category)
            .map(cmd => (this._isAllowed(cmd, message) ? `\`${cmd.aliases[0]}\`` : `~~\`${cmd.aliases[0]}\`~~`))
            .join(messages.miscellaneous.separator),
        );
      }
    }

    await message.channel.send({ embeds: [embed] });
  }

  private _isAllowed(_cmd: Command, _message: GuildMessage): boolean {
    return true;
  }
}

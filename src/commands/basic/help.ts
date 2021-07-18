import { ApplyOptions } from '@sapphire/decorators';
import { MessageEmbed } from 'discord.js';
import uniq from 'lodash.uniq';
import pupa from 'pupa';
import Arguments from '@/app/decorators/Arguments';
import SwanCommand from '@/app/structures/commands/SwanCommand';
import type SwanCommandStore from '@/app/structures/commands/SwanCommandStore';
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
  public override async run(message: GuildMessage, args: HelpCommandArguments): Promise<void> {
    const { prefix } = settings.bot;

    const embed = new MessageEmbed()
      .setColor(settings.colors.default);

    if (args.command) {
      const information = config.messages.commandInfo;
      embed.setTitle(pupa(information.title, { command: args.command }))
        .addField(information.usage, `\`${prefix}${args.command.usage}\``)
        .addField(information.description, args.command.description)
        .addField(information.usableBy, args.command?.permission ?? messages.global.everyone);

      if (args.command.aliases.length > 1)
        embed.addField(information.aliases, `\`${args.command.aliases.join(`\`${messages.miscellaneous.separator}\``)}\``);
      if (args.command?.examples?.length)
        embed.addField(information.examples, `\`${prefix}${args.command.examples.join(`\`${messages.miscellaneous.separator}\`${prefix}`)}\``);
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

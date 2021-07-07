import { Command } from 'discord-akairo';
import { MessageEmbed } from 'discord.js';
import pupa from 'pupa';
import { Rules } from '@/app/types';
import type { GuildMessage } from '@/app/types';
import type { HelpCommandArguments } from '@/app/types/CommandArguments';
import { capitalize } from '@/app/utils';
import { help as config } from '@/conf/commands/basic';
import messages from '@/conf/messages';
import settings from '@/conf/settings';

class HelpCommand extends Command {
  constructor() {
    super('help', {
      aliases: config.settings.aliases,
      details: config.details,
      args: [{
        id: 'command',
        type: 'commandAlias',
      }],
      clientPermissions: config.settings.clientPermissions,
      userPermissions: config.settings.userPermissions,
      channel: 'guild',
    });
    this.rules = Rules.OnlyBotChannel;
  }

  public async exec(message: GuildMessage, args: HelpCommandArguments): Promise<void> {
    const { command } = args;
    const { prefix, categories } = this.handler;

    const embed = new MessageEmbed()
      .setColor(settings.colors.default);

    if (command) {
      const information = config.messages.commandInfo;
      embed.setTitle(pupa(information.title, { command }))
        .addField(information.usage, `\`${prefix}${command.details.usage}\``)
        .addField(information.description, command.details.content)
        .addField(information.usableBy, command.details?.permissions ?? messages.global.everyone);

      if (command.aliases.length > 1)
        embed.addField(information.aliases, `\`${command.aliases.join(`\`${messages.miscellaneous.separator}\``)}\``);
      if (command.details?.examples?.length)
        embed.addField(information.examples, `\`${prefix}${command.details.examples.join(`\`${messages.miscellaneous.separator}\`${prefix}`)}\``);
    } else {
      const information = config.messages.commandsList;
      const amount = categories
        .array()
        .flatMap(category => category.array())
        .length;

      embed.setTitle(pupa(information.title, { amount }))
        .setDescription(pupa(information.description, { helpCommand: `${prefix}${this.details.usage}` }));

      for (const category of categories.array()) {
        embed.addField(
          pupa(information.category, { categoryName: capitalize(category.id) }),
          category
            .map(cmd => (this._isAllowed(cmd, message) ? `\`${cmd.aliases[0]}\`` : `~~\`${cmd.aliases[0]}\`~~`))
            .join(messages.miscellaneous.separator),
        );
      }
    }

    await message.channel.send(embed);
  }

  // Permission-check borrowed from https://github.com/discord-akairo/discord-akairo/blob/23bb3c1765d58059e43e587a1dd602d4394d3f54/src/struct/commands/CommandHandler.js#L669
  private _isAllowed(cmd: Command, message: GuildMessage): boolean {
    if (cmd.userPermissions) {
      const ignorer = cmd.ignorePermissions ?? this.ignorePermissions;
      const isIgnored = Array.isArray(ignorer)
        ? ignorer.includes(message.author.id)
        : typeof ignorer === 'function'
          ? ignorer(message, cmd)
          : message.author.id === ignorer;

      if (!isIgnored) {
        if (typeof cmd.userPermissions === 'function') {
          // TODO: Support async `userPermissions` functions?
          if (cmd.userPermissions(message) !== null)
            return false;
        } else if (message.guild) {
          const missing = message.channel.permissionsFor(message.author)?.missing(cmd.userPermissions);
          if (missing && missing.length > 0)
            return false;
        }
      }
    }
    return true;
  }
}

export default HelpCommand;

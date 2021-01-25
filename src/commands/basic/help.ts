import { Command } from 'discord-akairo';
import { MessageEmbed } from 'discord.js';
import pupa from 'pupa';
import { Rules } from '@/app/types';
import type { GuildMessage } from '@/app/types';
import type { HelpCommandArguments } from '@/app/types/CommandArguments';
import { capitalize } from '@/app/utils';
import { help as config } from '@/conf/commands/basic';
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
    this.rules = [Rules.OnlyBotChannel];
  }

  public async exec(message: GuildMessage, args: HelpCommandArguments): Promise<void> {
    const { command } = args;
    const { prefix, categories } = this.handler;

    const embed = new MessageEmbed()
      .setColor(settings.colors.default);

    if (command) {
      const messages = config.messages.commandInfo;
      embed.setTitle(pupa(messages.title, { command }))
        .addField(messages.usage, `\`${prefix}${command.details.usage}\``)
        .addField(messages.description, command.details.content)
        .addField(messages.usableBy, command.details?.permissions || 'Tout le monde');

      if (command.aliases.length > 1)
        embed.addField(messages.aliases, `\`${command.aliases.join('` • `')}\``);
      if (command.details?.examples?.length)
        embed.addField(messages.examples, `\`${prefix}${command.details.examples.join(`\` • \`${prefix}`)}\``);
    } else {
      const messages = config.messages.commandsList;
      const amount = categories
        .array()
        .flatMap(category => category.array())
        .length;

      embed.setTitle(pupa(messages.title, { amount }))
        .setDescription(pupa(messages.description, { helpCommand: `${prefix}${this.details.usage}` }));

      for (const category of categories.array()) {
        embed.addField(
          pupa(messages.category, { categoryName: capitalize(category.id) }),
          category
            .map(cmd => (this._isAllowed(cmd, message) ? `\`${cmd.aliases[0]}\`` : `~~\`${cmd.aliases[0]}\`~~`))
            .join(' • '),
        );
      }
    }

    await message.channel.send(embed);
  }

  // Permission-check borrowed from https://github.com/discord-akairo/discord-akairo/blob/23bb3c1765d58059e43e587a1dd602d4394d3f54/src/struct/commands/CommandHandler.js#L669
  private _isAllowed(cmd: Command, message: GuildMessage): boolean {
    if (cmd.userPermissions) {
      const ignorer = cmd.ignorePermissions || this.ignorePermissions;
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
          const missing = message.channel.permissionsFor(message.author).missing(cmd.userPermissions);
          if (missing.length > 0)
            return false;
        }
      }
    }
    return true;
  }
}

export default HelpCommand;

import { Command } from 'discord-akairo';
import { MessageEmbed } from 'discord.js';
import { help as config } from '../../../config/commands/basic';
import settings from '../../../config/settings';
import type { HelpCommandArguments } from '../../types/CommandArguments';
import Rules from '../../types/rules';
import type { GuildMessage } from '../../types/utils';
import { capitalize } from '../../utils';

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
    const { prefix } = this.handler;

    const embed = new MessageEmbed()
      .setColor(settings.colors.default);

    if (command) {
      const messages = config.messages.commandInfo;
      embed.setTitle(messages.title.replace('{NAME}', command.details.name))
        .addField(messages.usage, `\`${prefix}${command.details.usage}\``)
        .addField(messages.description, command.details.content)
        .addField(messages.usableBy, command.details?.permissions || 'Tout le monde');

      if (command.aliases.length > 1)
        embed.addField(messages.aliases, `\`${command.aliases.join('` • `')}\``);
      if (command.details?.examples?.length)
        embed.addField(messages.examples, `\`${prefix}${command.details.examples.join(`\` • \`${prefix}`)}\``);
    } else {
      const messages = config.messages.commandsList;
      const amount = this.handler.categories
        .array()
        .flatMap(category => category.array())
        .length;

      embed.setTitle(messages.title.replace('{NUMBER}', amount.toString()))
        .setDescription(messages.description.replace('{COMMAND}', `${prefix}${this.details.usage}`));

      for (const category of this.handler.categories.array()) {
        embed.addField(
          messages.category.replace('{CATEGORY}', capitalize(category.id)),
          category.map(cmd => `\`${cmd.aliases[0]}\``).join(' • '),
        );
      }
    }

    await message.util.send(embed);
  }
}

export default HelpCommand;

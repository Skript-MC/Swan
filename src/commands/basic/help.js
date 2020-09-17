import { Command } from 'discord-akairo';
import { MessageEmbed } from 'discord.js';
import { help as config } from '../../../config/commands/basic';
import settings from '../../../config/settings';
import { capitalize } from '../../utils';

class HelpCommand extends Command {
  constructor() {
    super('help', {
      aliases: config.settings.aliases,
      description: { ...config.description },
      args: [{
        id: 'command',
        type: 'commandAlias',
      }],
      clientPermissions: config.settings.clientPermissons,
      userPermissions: config.settings.userPermissions,
      channel: 'guild',
    });
  }

  async exec(message, args) {
    if (settings.channels.help.includes(message.channel.id))
      return;

    const { command } = args;
    const { prefix } = this.handler;

    const embed = new MessageEmbed()
      .setColor(settings.colors.default);

    if (command) {
      const messages = config.messages.commandInfo;
      embed.setTitle(messages.title.replace('{NAME}', command.description?.name || command.aliases[0]))
        .addField(messages.usage, `\`${prefix}${command.description?.usage}\`` || messages.unavailabe)
        .addField(messages.description, command.description?.content || messages.unavailabe)
        .addField(messages.usableBy, command.description?.permissions || 'Tout le monde');

      if (command.aliases.length > 1)
        embed.addField(messages.aliases, `\`${command.aliases.join('` • `')}\``);
      if (command.description?.examples?.length)
        embed.addField(messages.examples, `\`${prefix}${command.description.examples.join(`\` • \`${prefix}`)}\``);
    } else {
      const messages = config.messages.commandsList;
      // For each category, return the array of all the commands it contains, flat it and get its length.
      const number = this.handler.categories.array().flatMap(category => category.array()).length;

      embed.setTitle(messages.title.replace('{NUMBER}', number))
        .setDescription(messages.description.replace('{COMMAND}', `${prefix}${this.description.usage}`));

      for (const category of this.handler.categories.array()) {
        embed.addField(
          messages.category.replace('{CATEGORY}', capitalize(category.id)),
          category.map(cmd => `\`${cmd.aliases[0]}\``).join(' • '),
        );
      }
    }

    return message.util.send(embed);
  }
}

export default HelpCommand;

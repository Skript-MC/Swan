import { Argument, Command } from 'discord-akairo';
import { MessageEmbed } from 'discord.js';
import { links as config } from '../../../config/commands/basic';

const reactions = ['⏮', '◀', '🇽', '▶', '⏭'];
const maxPage = 5;

class LinksCommand extends Command {
  constructor() {
    super('links', {
      aliases: config.settings.aliases,
      description: { ...config.description },
      args: [{
        id: 'page',
        type: Argument.range('integer', 0, maxPage),
        default: 0,
      }],
      clientPermissions: config.settings.clientPermissions,
      userPermissions: config.settings.userPermissions,
      channel: 'guild',
    });
  }

  async exec(message, args) {
    let { page } = args;
    const msg = await message.util.send(this.getEmbedForPage(page));

    const collector = msg
      .createReactionCollector((reaction, user) => user.id === message.author.id
        && reactions.includes(reaction.emoji.name))
      .on('collect', (reaction) => {
        reaction.users.remove(message.author);
        if (reaction.emoji.name === '🇽') {
          message.delete();
          msg.delete();
          collector.stop();
          return;
        }

        const oldPage = page;
        if (reaction.emoji.name === '⏮')
          page = 0;
        else if (reaction.emoji.name === '◀')
          page = page === 0 ? 0 : page - 1;
        else if (reaction.emoji.name === '▶')
          page = page === maxPage ? maxPage : page + 1;
        else if (reaction.emoji.name === '⏭')
          page = maxPage;

        if (oldPage !== page)
          msg.edit(this.getEmbedForPage(page));
      });

    for (const reaction of reactions)
      msg.react(reaction);
  }

  getEmbedForPage(page) {
    const embed = new MessageEmbed();
    const content = page === 0
      ? config.messages.embed.summary
      : config.messages.embed.fields[page - 1];

    if (page === 0) {
      embed.setDescription(content);
    } else {
      embed.addField(...content[0]);
      embed.addField(...content[1]);
    }
    return embed;
  }
}

export default LinksCommand;

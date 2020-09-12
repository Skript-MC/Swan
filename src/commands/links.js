import { Command } from 'discord-akairo';
import { MessageEmbed } from 'discord.js';

const reactions = ['⏮', '◀', '🇽', '▶', '⏭'];
const maxPage = 5;

class LinksCommand extends Command {
  constructor() {
    super('links', {
      aliases: ['links'],
      args: [{
        id: 'page',
        type: (_message, phrase) => {
          if (!phrase || isNaN(phrase)) return null;
          const num = parseInt(phrase, 10);
          if (num < 0 || num > maxPage) return null;
          return num;
        },
        default: 0,
      }],
      channel: 'guild',
    });
  }

  async exec(message, args) {
    let { page } = args;
    const msg = await message.util.send(this.getEmbedForPage(page));
    for (const reaction of reactions)
      msg.react(reaction);

    const collector = msg
      .createReactionCollector((reaction, user) => user.id === message.author.id
        && reactions.includes(reaction.emoji.name))
      .on('collect', (reaction) => {
        reaction.users.remove(message.author);
        if (reaction.emoji.name === '🇽') {
          message.delete();
          msg.deletet();
          collector.stop();
          return;
        }

        if (reaction.emoji.name === '⏮')
          page = 0;
        else if (reaction.emoji.name === '◀')
          page--;
        else if (reaction.emoji.name === '▶')
          page++;
        else if (reaction.emoji.name === '⏭')
          page = maxPage;
        msg.edit(this.getEmbedForPage(page));
      });
  }

  getEmbedForPage(page) {
    const embed = new MessageEmbed();
    const content = this.getMessageForPage(page);

    if (page === 0) {
      embed.setDescription(content);
    } else {
      embed.addField(...content[0]);
      embed.addField(...content[1]);
    }
    return embed;
  }

  getMessageForPage(page) {
    const content = this.client.messages.links.embed;

    switch (page) {
      case 0:
        return content.summary;
      case 1:
        return [
          [content.docSkSkMc_title, content.docSkSkMc_desc],
          [content.docSkOffi_title, content.docSkOffi_desc],
        ];
      case 2:
        return [
          [content.docAddSkMc_title, content.docAddSkMc_desc],
          [content.docAdd_title, content.docAdd_desc],
        ];
      case 3:
        return [
          [content.dlSk_title, content.dlSk_desc],
          [content.dlAdd_title, content.dlAdd_desc],
        ];
      case 4:
        return [
          [content.discSkMc_title, content.discSkMc_desc],
          [content.discSkCh_title, content.discSkCh_desc],
        ];
      case 5:
        return [
          [content.forumSkMc_title, content.forumSkMc_desc],
          [content.gitSk_title, content.gitSk_desc],
        ];
    }
  }
}

export default LinksCommand;

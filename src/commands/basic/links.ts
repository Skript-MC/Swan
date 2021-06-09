import { Argument, Command } from 'discord-akairo';
import type { MessageReaction, User } from 'discord.js';
import { MessageEmbed } from 'discord.js';
import type { GuildMessage } from '@/app/types';
import type { LinksCommandArguments } from '@/app/types/CommandArguments';
import { links as config } from '@/conf/commands/basic';
import settings from '@/conf/settings';

const reactions = ['⏮', '◀', '🇽', '▶', '⏭'];
const maxPage = 5;

class LinksCommand extends Command {
  constructor() {
    super('links', {
      aliases: config.settings.aliases,
      details: config.details,
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

  public async exec(message: GuildMessage, args: LinksCommandArguments): Promise<void> {
    let { page } = args;
    const msg = await message.channel.send(this._getEmbedForPage(page));

    const collector = msg
      .createReactionCollector((reaction: MessageReaction, user: User) => user.id === message.author.id
        && reactions.includes(reaction.emoji.name))
      .on('collect', async (reaction) => {
        await reaction.users.remove(message.author);
        if (reaction.emoji.name === '🇽') {
          collector.stop();
          await message.delete();
          await msg.delete();
          return;
        }

        const oldPage = page;
        switch (reaction.emoji.name) {
          case '⏮': {
            page = 0;
            break;
          }
          case '◀': {
            page = page === 0 ? 0 : page - 1;
            break;
          }
          case '▶': {
            page = page === maxPage ? maxPage : page + 1;
            break;
          }
          case '⏭': {
            page = maxPage;
            break;
          }
        }

        if (oldPage !== page)
          await msg.edit(this._getEmbedForPage(page));
      });

    for (const reaction of reactions)
      void await msg.react(reaction);
  }

  private _getEmbedForPage(page: number): MessageEmbed {
    const embed = new MessageEmbed().setColor(settings.colors.default);

    if (page === 0) {
      embed.setDescription(config.messages.embed.summary);
    } else {
      const content = config.messages.embed.fields[page - 1];
      embed.addField(content[0].title, content[0].description);
      embed.addField(content[1].title, content[1].description);
    }
    return embed;
  }
}

export default LinksCommand;

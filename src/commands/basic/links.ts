import { ApplyOptions } from '@sapphire/decorators';
import type { MessageReaction, User } from 'discord.js';
import { MessageEmbed } from 'discord.js';
import Arguments from '@/app/decorators/Arguments';
import SwanCommand from '@/app/structures/commands/SwanCommand';
import { GuildMessage } from '@/app/types';
import type { SwanCommandOptions } from '@/app/types';
import { LinksCommandArguments } from '@/app/types/CommandArguments';
import { links as config } from '@/conf/commands/basic';
import settings from '@/conf/settings';

const reactions = ['⏮', '◀', '🇽', '▶', '⏭'];
const maxPage = 5;

@ApplyOptions<SwanCommandOptions>({ ...settings.globalCommandsOptions, ...config.settings })
export default class LinksCommand extends SwanCommand {
  @Arguments({
    name: 'page',
    type: 'integer',
    match: 'pick',
    default: 0,
  })
  // @ts-expect-error ts(2416)
  public override async run(message: GuildMessage, args: LinksCommandArguments): Promise<void> {
    const msg = await message.channel.send(this._getEmbedForPage(args.page));

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

        const oldPage = args.page;
        switch (reaction.emoji.name) {
          case '⏮': {
            args.page = 0;
            break;
          }
          case '◀': {
            args.page = args.page === 0 ? 0 : args.page - 1;
            break;
          }
          case '▶': {
            args.page = args.page === maxPage ? maxPage : args.page + 1;
            break;
          }
          case '⏭': {
            args.page = maxPage;
            break;
          }
        }

        if (oldPage !== args.page)
          await msg.edit(this._getEmbedForPage(args.page));
      });

    for (const reaction of reactions)
      await msg.react(reaction);
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

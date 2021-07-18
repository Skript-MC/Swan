import { ApplyOptions } from '@sapphire/decorators';
import type { Args } from '@sapphire/framework';
import type { MessageReaction, User } from 'discord.js';
import { MessageEmbed } from 'discord.js';
import SwanCommand from '@/app/structures/commands/SwanCommand';
import type { GuildMessage, SwanCommandOptions } from '@/app/types';
import { links as config } from '@/conf/commands/basic';
import settings from '@/conf/settings';

const reactions = ['⏮', '◀', '🇽', '▶', '⏭'];
const maxPage = 5;

@ApplyOptions<SwanCommandOptions>({ ...settings.globalCommandsOptions, ...config.settings })
export default class LinksCommand extends SwanCommand {
  // [{
  //   id: 'page',
  //   type: Argument.range('integer', 0, maxPage),
  //   default: 0,
  // }],

  public override async run(message: GuildMessage, args: Args): Promise<void> {
    let page = (await args.pickResult('integer', { minimum: 0, maximum: maxPage }))?.value ?? 0;
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

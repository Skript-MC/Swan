import { ApplyOptions } from '@sapphire/decorators';
import type { Args } from '@sapphire/framework';
import type { MessageReaction, User } from 'discord.js';
import SwanCommand from '@/app/structures/commands/SwanCommand';
import type { GuildMessage, SwanCommandOptions } from '@/app/types';
import { noop } from '@/app/utils';
import { latex as config } from '@/conf/commands/fun';
import messages from '@/conf/messages';
import settings from '@/conf/settings';

@ApplyOptions<SwanCommandOptions>({ ...settings.globalCommandsOptions, ...config.settings })
export default class LatexCommand extends SwanCommand {
  // [{
  //   id: 'equation',
  //   type: 'string',
  //   match: 'content',
  //   prompt: {
  //     start: config.messages.startPrompt,
  //     retry: config.messages.retryPrompt,
  //   },
  // }],

  public async run(message: GuildMessage, args: Args): Promise<void> {
    const equation = await args.restResult('string');
    if (equation.error)
      return void await message.channel.send(config.messages.retryPrompt);

    const sendMessage = await message.channel.send(settings.apis.latex + encodeURIComponent(equation.value));
    await sendMessage.react(settings.emojis.remove).catch(noop);
    const collector = sendMessage
      .createReactionCollector((reaction: MessageReaction, user: User) => user.id === message.author.id
        && !user.bot
        && (reaction.emoji.id ?? reaction.emoji.name) === settings.emojis.remove)
      .on('collect', async () => {
        try {
          collector.stop();
          await sendMessage.delete();
        } catch {
          await message.channel.send(messages.global.oops).catch(noop);
        }
      });
  }
}

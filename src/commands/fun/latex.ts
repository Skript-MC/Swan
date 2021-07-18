import { ApplyOptions } from '@sapphire/decorators';
import type { MessageReaction, User } from 'discord.js';
import Arguments from '@/app/decorators/Arguments';
import SwanCommand from '@/app/structures/commands/SwanCommand';
import { GuildMessage } from '@/app/types';
import type { SwanCommandOptions } from '@/app/types';
import { LatexCommandArguments } from '@/app/types/CommandArguments';
import { noop } from '@/app/utils';
import { latex as config } from '@/conf/commands/fun';
import messages from '@/conf/messages';
import settings from '@/conf/settings';

@ApplyOptions<SwanCommandOptions>({ ...settings.globalCommandsOptions, ...config.settings })
export default class LatexCommand extends SwanCommand {
  @Arguments({
    name: 'jokeName',
    type: 'string',
    match: 'rest',
    required: true,
    message: config.messages.retryPrompt,
  })
  // @ts-expect-error ts(2416)
  public override async run(message: GuildMessage, args: LatexCommandArguments): Promise<void> {
    const sendMessage = await message.channel.send(settings.apis.latex + encodeURIComponent(args.equation));
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

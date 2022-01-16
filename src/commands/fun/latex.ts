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
  public override async messageRun(message: GuildMessage, args: Args): Promise<void> {
    const equation = await args.restResult('string');
    if (!equation.success) {
      await message.channel.send(messages.prompt.equation);
      return;
    }

    await this._exec(message, equation.value);
  }

  private async _exec(message: GuildMessage, equation: string): Promise<void> {
    const sendMessage = await message.channel.send(settings.apis.latex + encodeURIComponent(equation));
    await sendMessage.react(settings.emojis.remove).catch(noop);
    const collector = sendMessage
      .createReactionCollector({
        filter: (reaction: MessageReaction, user: User) => user.id === message.author.id
          && !user.bot
          && (reaction.emoji.id ?? reaction.emoji.name) === settings.emojis.remove,
      }).on('collect', async () => {
        try {
          collector.stop();
          await sendMessage.delete();
        } catch {
          await message.channel.send(messages.global.oops).catch(noop);
        }
      });
  }
}

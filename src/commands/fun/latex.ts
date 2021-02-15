import { Command } from 'discord-akairo';
import type { MessageReaction, User } from 'discord.js';
import type { GuildMessage } from '@/app/types';
import type { LatexCommandArguments } from '@/app/types/CommandArguments';
import { noop } from '@/app/utils';
import { latex as config } from '@/conf/commands/fun';
import messages from '@/conf/messages';
import settings from '@/conf/settings';

class LatexCommand extends Command {
  constructor() {
    super('latex', {
      aliases: config.settings.aliases,
      details: config.details,
      clientPermissions: config.settings.clientPermissions,
      userPermissions: config.settings.userPermissions,
      channel: 'guild',
      args: [{
        id: 'equation',
        type: 'string',
        match: 'content',
        prompt: {
          start: config.messages.startPrompt,
          retry: config.messages.retryPrompt,
        },
      },
      ],
    });
  }

  public async exec(message: GuildMessage, args: LatexCommandArguments): Promise<void> {
    const sendMessage = await message.channel.send(settings.apis.latex + args.equation.replace(/\s/g, '&space;'));

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

export default LatexCommand;

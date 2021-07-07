import { Command } from 'discord-akairo';
import Message from '@/app/models/message';
import type { GuildMessage } from '@/app/types';
import { MessageName } from '@/app/types';
import type { ErrorDetailsCommandArguments } from '@/app/types/CommandArguments';
import { searchMessageSimilarity } from '@/app/utils';
import { errorDetails as config } from '@/conf/commands/basic';

class ErrorDetailsCommand extends Command {
  constructor() {
    super('errorDetails', {
      aliases: config.settings.aliases,
      details: config.details,
      args: [{
        id: 'error',
        type: 'string',
        match: 'content',
        prompt: {
          start: config.messages.startPrompt,
          retry: config.messages.retryPrompt,
        },
      }],
      clientPermissions: config.settings.clientPermissions,
      userPermissions: config.settings.userPermissions,
      channel: 'guild',
    });
  }

  public async exec(message: GuildMessage, args: ErrorDetailsCommandArguments): Promise<void> {
    const messages = await Message.find({ messageType: MessageName.ErrorDetail });
    const search = searchMessageSimilarity(messages, args.error);
    if (!search) {
      await message.channel.send(config.messages.notFound);
      return;
    }
    await message.channel.send(search.content);
  }
}

export default ErrorDetailsCommand;

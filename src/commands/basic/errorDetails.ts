import { Command } from 'discord-akairo';
import { errorDetails as config } from '../../../config/commands/basic';
import Message from '../../models/message';
import type { GuildMessage, MessageDocument } from '../../types';
import type { ErrorDetailsCommandArguments } from '../../types/CommandArguments';
import { searchMessageSimilarity } from '../../utils';

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
    const messages = await Message.find({ messageType: 'error' });
    const search: MessageDocument = searchMessageSimilarity(messages, args.error);
    if (!search) {
      await message.channel.send(config.messages.notFound);
      return;
    }
    await message.channel.send(search.content);
  }
}

export default ErrorDetailsCommand;

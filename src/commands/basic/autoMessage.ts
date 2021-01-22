import { Command } from 'discord-akairo';
import { autoMessage as config } from '../../../config/commands/basic';
import Message from '../../models/message';
import type { GuildMessage, MessageDocument } from '../../types';
import type { AutoMessageCommandArguments } from '../../types/CommandArguments';
import { searchMessageSimilarity } from '../../utils';

class AutoMessageCommand extends Command {
  constructor() {
    super('autoMessage', {
      aliases: config.settings.aliases,
      details: config.details,
      args: [{
        id: 'message',
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

  public async exec(message: GuildMessage, args: AutoMessageCommandArguments): Promise<void> {
    const messages: MessageDocument[] = await Message.find({ messageType: 'auto' });
    const search: MessageDocument | null = searchMessageSimilarity(messages, args.message);
    if (!search) {
      await message.channel.send(config.messages.notFound);
      return;
    }
    await message.channel.send(search.content);
  }
}

export default AutoMessageCommand;

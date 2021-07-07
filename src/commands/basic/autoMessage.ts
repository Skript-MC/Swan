import { Command } from 'discord-akairo';
import Message from '@/app/models/message';
import type { GuildMessage } from '@/app/types';
import { MessageName } from '@/app/types';
import type { AutoMessageCommandArguments } from '@/app/types/CommandArguments';
import { searchMessageSimilarity } from '@/app/utils';
import { autoMessage as config } from '@/conf/commands/basic';

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
    const messages = await Message.find({ messageType: MessageName.AutoMessage });
    const search = searchMessageSimilarity(messages, args.message);
    if (!search) {
      await message.channel.send(config.messages.notFound);
      return;
    }
    await message.channel.send(search.content);
  }
}

export default AutoMessageCommand;

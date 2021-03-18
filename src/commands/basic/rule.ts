import { Command } from 'discord-akairo';
import Message from '@/app/models/message';
import type { GuildMessage, MessageDocument } from '@/app/types';
import { MessageName } from '@/app/types';
import type { RuleCommandArguments } from '@/app/types/CommandArguments';
import { searchMessageSimilarity } from '@/app/utils';
import { rule as config } from '@/conf/commands/basic';

class RuleCommand extends Command {
  constructor() {
    super('rule', {
      aliases: config.settings.aliases,
      details: config.details,
      args: [{
        id: 'rule',
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

  public async exec(message: GuildMessage, args: RuleCommandArguments): Promise<void> {
    const messages = await Message.find({ messageType: MessageName.Rule });
    const search: MessageDocument | null = searchMessageSimilarity(messages, args.rule);
    if (!search) {
      await message.channel.send(config.messages.notFound);
      return;
    }
    await message.channel.send(search.content);
  }
}

export default RuleCommand;

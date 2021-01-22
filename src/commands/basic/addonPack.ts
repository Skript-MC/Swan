import { Command } from 'discord-akairo';
import { addonPack as config } from '../../../config/commands/basic';
import Message from '../../models/message';
import type { GuildMessage, MessageDocument } from '../../types';
import type { AddonPackCommandArguments } from '../../types/CommandArguments';
import { searchMessageSimilarity } from '../../utils';

class AddonPackCommand extends Command {
  constructor() {
    super('addonPack', {
      aliases: config.settings.aliases,
      details: config.details,
      args: [{
        id: 'version',
        type: 'string',
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

  public async exec(message: GuildMessage, args: AddonPackCommandArguments): Promise<void> {
    const messages: MessageDocument[] = await Message.find({ messageType: 'addonpack' });
    const search: MessageDocument | null = searchMessageSimilarity(messages, args.version);
    if (!search) {
      await message.channel.send(config.messages.notFound);
      return;
    }
    await message.channel.send(search.content);
  }
}

export default AddonPackCommand;

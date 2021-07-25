import { Command } from 'discord-akairo';
import Message from '@/app/models/message';
import type { GuildMessage } from '@/app/types';
import { MessageName } from '@/app/types';
import type { AddonPackCommandArguments } from '@/app/types/CommandArguments';
import { searchMessageSimilarity } from '@/app/utils';
import { addonPack as config } from '@/conf/commands/basic';

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
    const messages = await Message.find({ messageType: MessageName.AddonPack });
    const search = searchMessageSimilarity(messages, args.version);
    if (!search) {
      await message.channel.send(config.messages.notFound);
      return;
    }
    await message.channel.send(search.content);
  }
}

export default AddonPackCommand;

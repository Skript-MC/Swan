import { ApplyOptions } from '@sapphire/decorators';
import type { Args } from '@sapphire/framework';
import Message from '@/app/models/message';
import SwanCommand from '@/app/structures/commands/SwanCommand';
import type { GuildMessage, SwanCommandOptions } from '@/app/types';
import { MessageName } from '@/app/types';
import { searchMessageSimilarity } from '@/app/utils';
import { autoMessage as config } from '@/conf/commands/basic';
import settings from '@/conf/settings';

@ApplyOptions<SwanCommandOptions>({ ...settings.globalCommandsOptions, ...config.settings })
export default class AutoMessageCommand extends SwanCommand {
  // [{
  //   id: 'message',
  //   type: 'string',
  //   match: 'content',
  //   prompt: {
  //     start: config.messages.startPrompt,
  //     retry: config.messages.retryPrompt,
  //   },
  // }],

  public async run(message: GuildMessage, args: Args): Promise<void> {
    const autoMessage = await args.restResult('string');
    if (autoMessage.error)
      return void await message.channel.send(config.messages.retryPrompt);

    const messages = await Message.find({ messageType: MessageName.AutoMessage });
    const search = searchMessageSimilarity(messages, autoMessage.value);
    if (!search) {
      await message.channel.send(config.messages.notFound);
      return;
    }
    await message.channel.send(search.content);
  }
}

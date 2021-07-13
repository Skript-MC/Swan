import { ApplyOptions } from '@sapphire/decorators';
import type { Args } from '@sapphire/framework';
import Message from '@/app/models/message';
import SwanCommand from '@/app/structures/commands/SwanCommand';
import type { GuildMessage, SwanCommandOptions } from '@/app/types';
import { MessageName } from '@/app/types';
import { searchMessageSimilarity } from '@/app/utils';
import { errorDetails as config } from '@/conf/commands/basic';
import settings from '@/conf/settings';

@ApplyOptions<SwanCommandOptions>({ ...settings.globalCommandsOptions, ...config.settings })
export default class ErrorDetailsCommand extends SwanCommand {
  // [{
  //   id: 'error',
  //   type: 'string',
  //   match: 'content',
  //   prompt: {
  //     start: config.messages.startPrompt,
  //     retry: config.messages.retryPrompt,
  //   },
  // }],

  public async run(message: GuildMessage, args: Args): Promise<void> {
    const query = await args.restResult('string');
    if (query.error)
      return void await message.channel.send(config.messages.retryPrompt);

    const messages = await Message.find({ messageType: MessageName.ErrorDetail });
    const search = searchMessageSimilarity(messages, query.value);
    if (!search) {
      await message.channel.send(config.messages.notFound);
      return;
    }
    await message.channel.send(search.content);
  }
}

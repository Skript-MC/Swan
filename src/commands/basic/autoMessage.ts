import { ApplyOptions } from '@sapphire/decorators';
import Arguments from '@/app/decorators/Argument';
import Message from '@/app/models/message';
import SwanCommand from '@/app/structures/commands/SwanCommand';
import type { SwanCommandOptions } from '@/app/types';
import { GuildMessage, MessageName } from '@/app/types';
import { AutoMessageCommandArguments } from '@/app/types/CommandArguments';
import { searchMessageSimilarity } from '@/app/utils';
import { autoMessage as config } from '@/conf/commands/basic';
import settings from '@/conf/settings';

@ApplyOptions<SwanCommandOptions>({ ...settings.globalCommandsOptions, ...config.settings })
export default class AutoMessageCommand extends SwanCommand {
  @Arguments({
    name: 'message',
    type: 'string',
    match: 'rest',
    required: true,
    message: config.messages.retryPrompt,
  })
  // @ts-expect-error ts(2416)
  public override async messageRun(message: GuildMessage, args: AutoMessageCommandArguments): Promise<void> {
    const messages = await Message.find({ messageType: MessageName.AutoMessage });
    const search = searchMessageSimilarity(messages, args.message);
    if (!search) {
      await message.channel.send(config.messages.notFound);
      return;
    }
    await message.channel.send(search.content);
  }
}

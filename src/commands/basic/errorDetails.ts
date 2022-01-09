import { ApplyOptions } from '@sapphire/decorators';
import Arguments from '@/app/decorators/Argument';
import Message from '@/app/models/message';
import SwanCommand from '@/app/structures/commands/SwanCommand';
import type { SwanCommandOptions } from '@/app/types';
import { GuildMessage, MessageName } from '@/app/types';
import { ErrorDetailsCommandArguments } from '@/app/types/CommandArguments';
import { searchMessageSimilarity } from '@/app/utils';
import { errorDetails as config } from '@/conf/commands/basic';
import messages from '@/conf/messages';
import settings from '@/conf/settings';

@ApplyOptions<SwanCommandOptions>({
  ...settings.globalCommandsOptions,
  ...config.settings,
  quotes: [],
})
export default class ErrorDetailsCommand extends SwanCommand {
  @Arguments({
    name: 'error',
    type: 'string',
    match: 'rest',
    required: true,
    message: messages.prompt.skriptError,
  })
  // @ts-expect-error ts(2416)
  public override async messageRun(message: GuildMessage, args: ErrorDetailsCommandArguments): Promise<void> {
    const msgs = await Message.find({ messageType: MessageName.ErrorDetail });
    const search = searchMessageSimilarity(msgs, args.query);
    if (!search) {
      await message.channel.send(config.messages.notFound);
      return;
    }
    await message.channel.send(search.content);
  }
}

import { ApplyOptions } from '@sapphire/decorators';
import type { Args } from '@sapphire/framework';
import Message from '@/app/models/message';
import SwanCommand from '@/app/structures/commands/SwanCommand';
import type { GuildMessage, SwanCommandOptions } from '@/app/types';
import { MessageName } from '@/app/types';
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
  public override async messageRun(message: GuildMessage, args: Args): Promise<void> {
    const query = await args.restResult('string');
    if (!query.success) {
      await message.channel.send(messages.prompt.skriptError);
      return;
    }

    await this._exec(message, query.value);
  }

  private async _exec(message: GuildMessage, query: string): Promise<void> {
    const msgs = await Message.find({ messageType: MessageName.ErrorDetail });
    const search = searchMessageSimilarity(msgs, query);
    if (!search) {
      await message.channel.send(config.messages.notFound);
      return;
    }
    await message.channel.send(search.content);
  }
}

import { ApplyOptions } from '@sapphire/decorators';
import type { Args } from '@sapphire/framework';
import pupa from 'pupa';
import Message from '@/app/models/message';
import SwanCommand from '@/app/structures/commands/SwanCommand';
import type { GuildMessage, SwanCommandOptions } from '@/app/types';
import { MessageName } from '@/app/types';
import { searchMessageSimilarity } from '@/app/utils';
import { rule as config } from '@/conf/commands/basic';
import settings from '@/conf/settings';

@ApplyOptions<SwanCommandOptions>({ ...settings.globalCommandsOptions, ...config.settings })
export default class RuleCommand extends SwanCommand {
  public override async messageRun(message: GuildMessage, args: Args): Promise<void> {
    const query = await args.restResult('string');

    await this._exec(message, query.value);
  }

  private async _exec(message: GuildMessage, query: string | null): Promise<void> {
    const msgs = await Message.find({ messageType: MessageName.Rule });

    if (!query) {
      const content = msgs.length === 0
        ? config.messages.noRules
        : pupa(config.messages.list, { list: `- ${msgs.map(msg => msg.content).join('\n- ')}` });
      await message.channel.send(content);
      return;
    }

    const search = searchMessageSimilarity(msgs, query);
    if (!search) {
      await message.channel.send(config.messages.notFound);
      return;
    }
    await message.channel.send(search.content);
  }
}

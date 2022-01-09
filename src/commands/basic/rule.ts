import { ApplyOptions } from '@sapphire/decorators';
import { isNullish } from '@sapphire/utilities';
import pupa from 'pupa';
import Arguments from '@/app/decorators/Argument';
import Message from '@/app/models/message';
import SwanCommand from '@/app/structures/commands/SwanCommand';
import type { SwanCommandOptions } from '@/app/types';
import { GuildMessage, MessageName } from '@/app/types';
import { RuleCommandArguments } from '@/app/types/CommandArguments';
import { searchMessageSimilarity } from '@/app/utils';
import { rule as config } from '@/conf/commands/basic';
import settings from '@/conf/settings';

@ApplyOptions<SwanCommandOptions>({ ...settings.globalCommandsOptions, ...config.settings })
export default class RuleCommand extends SwanCommand {
  @Arguments({
    name: 'query',
    type: 'string',
    match: 'rest',
  })
  // @ts-expect-error ts(2416)
  public override async messageRun(message: GuildMessage, args: RuleCommandArguments): Promise<void> {
    const msgs = await Message.find({ messageType: MessageName.Rule });

    if (isNullish(args.query)) {
      const content = msgs.length === 0
        ? config.messages.noRules
        : pupa(config.messages.list, { list: `- ${msgs.map(msg => msg.content).join('\n- ')}` });
      await message.channel.send(content);
      return;
    }

    const search = searchMessageSimilarity(msgs, args.query);
    if (!search) {
      await message.channel.send(config.messages.notFound);
      return;
    }
    await message.channel.send(search.content);
  }
}

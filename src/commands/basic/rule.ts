import { ApplyOptions } from '@sapphire/decorators';
import Arguments from '@/app/decorators/Argument';
import Message from '@/app/models/message';
import SwanCommand from '@/app/structures/commands/SwanCommand';
import type { SwanCommandOptions } from '@/app/types';
import { GuildMessage, MessageName } from '@/app/types';
import { RuleCommandArguments } from '@/app/types/CommandArguments';
import { searchMessageSimilarity } from '@/app/utils';
import { rule as config } from '@/conf/commands/basic';
import messages from '@/conf/messages';
import settings from '@/conf/settings';

@ApplyOptions<SwanCommandOptions>({ ...settings.globalCommandsOptions, ...config.settings })
export default class RuleCommand extends SwanCommand {
  @Arguments({
    name: 'rule',
    type: 'string',
    match: 'rest',
    required: true,
    message: messages.prompt.ruleName,
  })
  // @ts-expect-error ts(2416)
  public override async messageRun(message: GuildMessage, args: RuleCommandArguments): Promise<void> {
    const msgs = await Message.find({ messageType: MessageName.Rule });
    const search = searchMessageSimilarity(msgs, args.query);
    if (!search) {
      await message.channel.send(config.messages.notFound);
      return;
    }
    await message.channel.send(search.content);
  }
}

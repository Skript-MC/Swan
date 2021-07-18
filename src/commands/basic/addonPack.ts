import { ApplyOptions } from '@sapphire/decorators';
import Arguments from '@/app/decorators/Arguments';
import Message from '@/app/models/message';
import SwanCommand from '@/app/structures/commands/SwanCommand';
import type { SwanCommandOptions } from '@/app/types';
import { GuildMessage, MessageName } from '@/app/types';
import { AddonPackCommandArguments } from '@/app/types/CommandArguments';
import { searchMessageSimilarity } from '@/app/utils';
import { addonPack as config } from '@/conf/commands/basic';
import settings from '@/conf/settings';

@ApplyOptions<SwanCommandOptions>({ ...settings.globalCommandsOptions, ...config.settings })
export default class AddonPackCommand extends SwanCommand {
  @Arguments({
    name: 'version',
    type: 'string',
    match: 'rest',
    required: true,
    message: config.messages.retryPrompt,
  })
  // @ts-expect-error ts(2416)
  public override async run(message: GuildMessage, args: AddonPackCommandArguments): Promise<void> {
    const messages = await Message.find({ messageType: MessageName.AddonPack });
    const search = searchMessageSimilarity(messages, args.version);
    if (!search) {
      await message.channel.send(config.messages.notFound);
      return;
    }
    await message.channel.send(search.content);
  }
}

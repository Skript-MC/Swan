import { ApplyOptions } from '@sapphire/decorators';
import Arguments from '@/app/decorators/Argument';
import Message from '@/app/models/message';
import SwanCommand from '@/app/structures/commands/SwanCommand';
import type { SwanCommandOptions } from '@/app/types';
import { GuildMessage, MessageName } from '@/app/types';
import { AddonPackCommandArguments } from '@/app/types/CommandArguments';
import { searchMessageSimilarity } from '@/app/utils';
import { addonPack as config } from '@/conf/commands/basic';
import messages from '@/conf/messages';
import settings from '@/conf/settings';

@ApplyOptions<SwanCommandOptions>({ ...settings.globalCommandsOptions, ...config.settings })
export default class AddonPackCommand extends SwanCommand {
  @Arguments({
    name: 'version',
    type: 'string',
    match: 'pick',
    required: true,
    message: messages.prompt.minecraftVersion,
  })
  // @ts-expect-error ts(2416)
  public override async messageRun(message: GuildMessage, args: AddonPackCommandArguments): Promise<void> {
    // TODO: Remove this command's logic, send a hardcoded message telling packs should not be used.
    const msgs = await Message.find({ messageType: MessageName.AddonPack });
    const search = searchMessageSimilarity(msgs, args.version);
    if (!search) {
      await message.channel.send(config.messages.notFound);
      return;
    }
    await message.channel.send(search.content);
  }
}

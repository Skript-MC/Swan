import { ApplyOptions } from '@sapphire/decorators';
import type { Args } from '@sapphire/framework';
import Message from '@/app/models/message';
import SwanCommand from '@/app/structures/commands/SwanCommand';
import type { GuildMessage, SwanCommandOptions } from '@/app/types';
import { MessageName } from '@/app/types';
import { searchMessageSimilarity } from '@/app/utils';
import { addonPack as config } from '@/conf/commands/basic';
import messages from '@/conf/messages';
import settings from '@/conf/settings';

@ApplyOptions<SwanCommandOptions>({ ...settings.globalCommandsOptions, ...config.settings })
export default class AddonPackCommand extends SwanCommand {
  public override async messageRun(message: GuildMessage, args: Args): Promise<void> {
    const version = await args.pickResult('string');
    if (!version.success) {
      await message.channel.send(messages.prompt.minecraftVersion);
      return;
    }

    await this._exec(message, version.value);
  }

  private async _exec(message: GuildMessage, version: string): Promise<void> {
    // TODO: Remove this command's logic, send a hardcoded message telling packs should not be used.
    const msgs = await Message.find({ messageType: MessageName.AddonPack });
    const search = searchMessageSimilarity(msgs, version);
    if (!search) {
      await message.channel.send(config.messages.notFound);
      return;
    }
    await message.channel.send(search.content);
  }
}

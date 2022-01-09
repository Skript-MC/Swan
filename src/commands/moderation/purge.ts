import { ApplyOptions } from '@sapphire/decorators';
import pupa from 'pupa';
import Arguments from '@/app/decorators/Argument';
import SwanCommand from '@/app/structures/commands/SwanCommand';
import { GuildMessage } from '@/app/types';
import type { SwanCommandOptions } from '@/app/types';
import { PurgeCommandArgument } from '@/app/types/CommandArguments';
import { noop } from '@/app/utils';
import { purge as config } from '@/conf/commands/moderation';
import messages from '@/conf/messages';
import settings from '@/conf/settings';

const forceFlag = ['force', 'f'];

@ApplyOptions<SwanCommandOptions>({
  ...settings.globalCommandsOptions,
  ...config.settings,
  flags: forceFlag,
})
export default class PurgeCommand extends SwanCommand {
  @Arguments({
    name: 'force',
    match: 'flag',
    flags: forceFlag,
  }, {
    name: 'member',
    type: ['member', 'user'],
    match: 'pick',
  }, {
    name: 'amount',
    type: 'integer',
    match: 'pick',
    validate: (_messaege, value: number) => value >= 0 && value <= settings.moderation.purgeLimit + 1,
    required: true,
    message: messages.prompt.number,
  })
  // @ts-expect-error ts(2416)
  public override async messageRun(message: GuildMessage, args: PurgeCommandArgument): Promise<void> {
    await message.delete();

    // Fetch all the requested messages and filter out unwanted ones (from staff or not from the targeted user).
    const allMessages = await message.channel.messages.fetch({ limit: args.amount });
    const msgs = allMessages
      .filter(msg => (args.member ? msg.author.id === args.member.id : true))
      .filter(msg => (args.force || !msg.member?.roles.cache.has(settings.roles.staff)));
    const deletedMessages = await message.channel.bulkDelete(msgs, true);

    const msg = await message.channel.send(pupa(config.messages.success, { deletedMessages }));
    setTimeout(async () => {
      if (msg.deletable)
        await msg.delete().catch(noop);
    }, 5000);
  }
}

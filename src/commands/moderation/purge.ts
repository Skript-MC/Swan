import { ApplyOptions } from '@sapphire/decorators';
import type { Args } from '@sapphire/framework';
import type { GuildMember, User } from 'discord.js';
import pupa from 'pupa';
import SwanCommand from '@/app/structures/commands/SwanCommand';
import type { GuildMessage, SwanCommandOptions } from '@/app/types';
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
  public override async messageRun(message: GuildMessage, args: Args): Promise<void> {
    const force = args.getFlags(...forceFlag);

    const member = await args.pick('member')
      .catch(async () => args.pick('user'));

    const amount = await args.pickResult('integer').then(result => result.value);
    if (!amount || amount < 0 || amount > settings.moderation.purgeLimit) {
      await message.channel.send(messages.prompt.number);
      return;
    }

    await this._exec(message, force, member, amount);
  }

  private async _exec(
    message: GuildMessage,
    force: boolean,
    member: GuildMember | User,
    amount: number,
  ): Promise<void> {
    await message.delete();

    // Fetch all the requested messages and filter out unwanted ones (from staff or not from the targeted user).
    const allMessages = await message.channel.messages.fetch({ limit: amount });
    const msgs = allMessages
      .filter(msg => (member ? msg.author.id === member.id : true))
      .filter(msg => (force || !msg.member?.roles.cache.has(settings.roles.staff)));
    const deletedMessages = await message.channel.bulkDelete(msgs, true);

    const msg = await message.channel.send(pupa(config.messages.success, { deletedMessages }));
    setTimeout(async () => {
      if (msg.deletable)
        await msg.delete().catch(noop);
    }, 5000);
  }
}

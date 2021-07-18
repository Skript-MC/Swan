import { ApplyOptions } from '@sapphire/decorators';
import type { Args } from '@sapphire/framework';
import pupa from 'pupa';
import SwanCommand from '@/app/structures/commands/SwanCommand';
import type { GuildMessage, SwanCommandOptions } from '@/app/types';
import { noop, nullop } from '@/app/utils';
import { purge as config } from '@/conf/commands/moderation';
import settings from '@/conf/settings';

const forceFlags = ['f', 'force'];

@ApplyOptions<SwanCommandOptions>({
  ...config.settings,
  strategyOptions: {
    flags: [...forceFlags],
  },
})
export default class PurgeCommand extends SwanCommand {
  // [{
  //   id: 'amount',
  //   type: Argument.range('integer', 0, settings.moderation.purgeLimit + 1),
  //   unordered: true,
  //   prompt: {
  //     start: config.messages.startPrompt,
  //     retry: config.messages.retryPrompt,
  //   },
  // }, {
  //   id: 'member',
  //   type: Argument.union('member', 'user'),
  //   unordered: true,
  // }, {
  //   id: 'force',
  //   match: 'flag',
  //   flag: ['--force', '-f'],
  // }],

  public override async run(message: GuildMessage, args: Args): Promise<void> {
    const amount = await args.pickResult('integer', { minimum: 0, maximum: settings.moderation.purgeLimit + 1 });
    if (amount.error)
      return void await message.channel.send(config.messages.retryPrompt);

    const member = await args.pick('member')
      .catch(async () => await args.pick('user'))
      .catch(nullop);

    const force = args.getFlags(...forceFlags);

    // Add the message to the current-command-messages' store, to then bulk-delete them all.
    // message.util.messages.set(message.id, message);
    // await message.channel.bulkDelete(message.util.messages, true).catch(noop);
    await message.delete();

    // Fetch all the requested messages and filter out unwanted ones (from staff or not from the targeted user).
    const messages = (await message.channel.messages.fetch({ limit: amount.value }))
      .filter(msg => (member ? msg.author.id === member.id : true))
      .filter(msg => (force || !msg.member?.roles.cache.has(settings.roles.staff)));
    const deletedMessages = await message.channel.bulkDelete(messages, true);

    const msg = await message.channel.send(pupa(config.messages.success, { deletedMessages }));
    setTimeout(async () => {
      if (msg.deletable)
        await msg.delete().catch(noop);
    }, 5000);
  }
}

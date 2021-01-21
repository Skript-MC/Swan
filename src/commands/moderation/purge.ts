import { Argument, Command } from 'discord-akairo';
import pupa from 'pupa';
import { purge as config } from '../../../config/commands/moderation';
import settings from '../../../config/settings';
import type { GuildMessage } from '../../types';
import type { PurgeCommandArgument } from '../../types/CommandArguments';
import { noop } from '../../utils';

class PurgeCommand extends Command {
  constructor() {
    super('purge', {
      aliases: config.settings.aliases,
      details: config.details,
      args: [{
        id: 'amount',
        type: Argument.range('integer', 0, settings.moderation.purgeLimit),
        unordered: true,
        prompt: {
          start: config.messages.startPrompt,
          retry: config.messages.retryPrompt,
        },
      }, {
        id: 'member',
        type: Argument.union('member', 'user'),
        unordered: true,
      }, {
        id: 'force',
        match: 'flag',
        flag: ['--force', '-f'],
      }],
      clientPermissions: config.settings.clientPermissions,
      userPermissions: config.settings.userPermissions,
      channel: 'guild',
    });
  }

  public async exec(message: GuildMessage, args: PurgeCommandArgument): Promise<void> {
    const { amount, member, force } = args;

    message.util.messages.set(message.id, message);
    await message.channel.bulkDelete(message.util.messages, true).catch(noop);

    const messages = (await message.channel.messages.fetch({ limit: amount }))
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

export default PurgeCommand;

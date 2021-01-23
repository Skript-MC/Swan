import { Argument, Command } from 'discord-akairo';
import type { GuildMember } from 'discord.js';
import ConvictedUser from '@/app/models/convictedUser';
import ModerationData from '@/app/moderation/ModerationData';
import RemoveWarnAction from '@/app/moderation/actions/RemoveWarnAction';
import Logger from '@/app/structures/Logger';
import { SanctionTypes } from '@/app/types';
import type { GuildMessage } from '@/app/types';
import type { RemoveWarnCommandArgument } from '@/app/types/CommandArguments';
import { noop } from '@/app/utils';
import { removeWarn as config } from '@/conf/commands/moderation';
import messages from '@/conf/messages';

class RemoveWarnCommand extends Command {
  constructor() {
    super('removeWarn', {
      aliases: config.settings.aliases,
      details: config.details,

      args: [{
        id: 'member',
        type: Argument.validate(
          'member',
          (message: GuildMessage, _phrase: string, value: GuildMember) => value.id !== message.author.id
            && value.roles.highest.position < message.member.roles.highest.position,
        ),
        prompt: {
          start: config.messages.promptStartMember,
          retry: config.messages.promptRetryMember,
        },
      }, {
        id: 'reason',
        type: 'string',
        match: 'rest',
        default: messages.global.noReason,
      }],
      clientPermissions: config.settings.clientPermissions,
      userPermissions: config.settings.userPermissions,
      channel: 'guild',
    });
  }

  public async exec(message: GuildMessage, args: RemoveWarnCommandArgument): Promise<void> {
    try {
      const convictedUser = await ConvictedUser.findOne({ memberId: args.member.id });
      if (!convictedUser || convictedUser.currentWarnCount === 0) {
        await message.channel.send(config.messages.notWarned);
        return;
      }

      const data = new ModerationData(message)
        .setVictim(args.member)
        .setReason(args.reason)
        .setType(SanctionTypes.RemoveWarn);

      const success = await new RemoveWarnAction(data).commit();
      if (success)
        await message.channel.send(config.messages.success).catch(noop);
    } catch (unknownError: unknown) {
      Logger.error('An unexpected error occured while removing a warn from member!');
      Logger.detail(`Parsed member: ${args.member}`);
      Logger.detail(`Message: ${message.url}`);
      Logger.detail((unknownError as Error).stack, true);
      await message.channel.send(messages.global.oops).catch(noop);
    }
  }
}

export default RemoveWarnCommand;

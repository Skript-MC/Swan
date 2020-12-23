import { Argument, Command } from 'discord-akairo';
import type { Message } from 'discord.js';
import { unmute as config } from '../../../config/commands/moderation';
import messages from '../../../config/messages';
import ConvictedUser from '../../models/convictedUser';
import ModerationData from '../../moderation/ModerationData';
import UnmuteAction from '../../moderation/actions/UnmuteAction';
import Logger from '../../structures/Logger';
import type { UnmuteCommandArgument } from '../../types/CommandArguments';
import { SanctionTypes } from '../../types/sanctionsTypes';
import { noop } from '../../utils';

class UnmuteCommand extends Command {
  constructor() {
    super('unmute', {
      aliases: config.settings.aliases,
      details: config.details,

      args: [{
        id: 'member',
        type: Argument.validate(
          'member',
          (message, _phrase, value) => value.id !== message.author.id
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

  public async exec(message: Message, args: UnmuteCommandArgument): Promise<void> {
    try {
      const convictedUser = await ConvictedUser.findOne({ memberId: args.member.id });
      if (!convictedUser?.lastMuteId) {
        await message.util.send(config.messages.notMuted);
        return;
      }

      const data = new ModerationData(message)
        .setVictim(args.member)
        .setReason(args.reason)
        .setType(SanctionTypes.Unmute);

      const success = await new UnmuteAction(data).commit();
      if (success)
        await message.util.send(config.messages.success).catch(noop);
    } catch (unknownError: unknown) {
      Logger.error('An unexpected error occured while unmuting a member!');
      Logger.detail(`Parsed member: ${args.member}`);
      Logger.detail(`Message: ${message.url}`);
      Logger.detail((unknownError as Error).stack, true);
      await message.util.send(messages.global.oops).catch(noop);
    }
  }
}

export default UnmuteCommand;

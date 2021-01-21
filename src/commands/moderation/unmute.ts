import { Argument, Command } from 'discord-akairo';
import type { GuildMember } from 'discord.js';
import { unmute as config } from '../../../config/commands/moderation';
import messages from '../../../config/messages';
import ConvictedUser from '../../models/convictedUser';
import ModerationData from '../../moderation/ModerationData';
import UnmuteAction from '../../moderation/actions/UnmuteAction';
import Logger from '../../structures/Logger';
import { SanctionTypes } from '../../types';
import type { GuildMessage } from '../../types';
import type { UnmuteCommandArgument } from '../../types/CommandArguments';
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

  public async exec(message: GuildMessage, args: UnmuteCommandArgument): Promise<void> {
    try {
      const convictedUser = await ConvictedUser.findOne({ memberId: args.member.id });
      if (!convictedUser?.lastMuteId) {
        await message.channel.send(config.messages.notMuted);
        return;
      }

      const data = new ModerationData(message)
        .setVictim(args.member)
        .setReason(args.reason)
        .setType(SanctionTypes.Unmute);

      const success = await new UnmuteAction(data).commit();
      if (success)
        await message.channel.send(config.messages.success).catch(noop);
    } catch (unknownError: unknown) {
      Logger.error('An unexpected error occured while unmuting a member!');
      Logger.detail(`Parsed member: ${args.member}`);
      Logger.detail(`Message: ${message.url}`);
      Logger.detail((unknownError as Error).stack, true);
      await message.channel.send(messages.global.oops).catch(noop);
    }
  }
}

export default UnmuteCommand;

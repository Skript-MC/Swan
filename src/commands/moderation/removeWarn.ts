import { Argument, Command } from 'discord-akairo';
import { removeWarn as config } from '../../../config/commands/moderation';
import messages from '../../../config/messages';
import ConvictedUser from '../../models/convictedUser';
import ModerationData from '../../moderation/ModerationData';
import RemoveWarnAction from '../../moderation/actions/RemoveWarnAction';
import Logger from '../../structures/Logger';
import type { RemoveWarnCommandArgument } from '../../types/CommandArguments';
import { SanctionTypes } from '../../types/sanctionsTypes';
import type { GuildMessage } from '../../types/utils';
import { noop } from '../../utils';

class RemoveWarnCommand extends Command {
  constructor() {
    super('removeWarn', {
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

  public async exec(message: GuildMessage, args: RemoveWarnCommandArgument): Promise<void> {
    try {
      const convictedUser = await ConvictedUser.findOne({ memberId: args.member.id });
      if (!convictedUser || convictedUser.currentWarnCount === 0) {
        await message.util.send(config.messages.notWarned);
        return;
      }

      const data = new ModerationData(message)
        .setVictim(args.member)
        .setReason(args.reason)
        .setType(SanctionTypes.RemoveWarn);

      const success = await new RemoveWarnAction(data).commit();
      if (success)
        await message.util.send(config.messages.success).catch(noop);
    } catch (unknownError: unknown) {
      Logger.error('An unexpected error occured while removing a warn from member!');
      Logger.detail(`Parsed member: ${args.member}`);
      Logger.detail(`Message: ${message.url}`);
      Logger.detail((unknownError as Error).stack, true);
      await message.util.send(messages.global.oops).catch(noop);
    }
  }
}

export default RemoveWarnCommand;

import { Argument, Command } from 'discord-akairo';
import { warn as config } from '../../../config/commands/moderation';
import messages from '../../../config/messages';
import settings from '../../../config/settings';
import ModerationData from '../../moderation/ModerationData';
import ModerationHelper from '../../moderation/ModerationHelper';
import WarnAction from '../../moderation/actions/WarnAction';
import Logger from '../../structures/Logger';
import { constants, noop } from '../../utils';

class WarnCommand extends Command {
  constructor() {
    super('warn', {
      aliases: config.settings.aliases,
      description: { ...config.description },

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
        prompt: {
          start: config.messages.promptStartReason,
          retry: config.messages.promptRetryReason,
        },
      }],
      clientPermissions: config.settings.clientPermissions,
      userPermissions: config.settings.userPermissions,
      channel: 'guild',
    });
  }

  async exec(message, args) {
    const isBanned = await ModerationHelper.isBanned(args.member.id);
    if (isBanned) {
      await message.util.send(messages.global.impossibleBecauseBanned).catch(noop);
      return;
    }

    try {
      const data = new ModerationData(message)
        .setVictim(args.member)
        .setReason(args.reason)
        .setDuration(settings.moderation.warnDuration * 1000, true)
        .setType(constants.SANCTIONS.TYPES.WARN);

      const success = await new WarnAction(data).commit();
      if (success)
        await message.util.send(config.messages.success).catch(noop);
    } catch (error) {
      Logger.error('An unexpected error occured while warning a member!');
      Logger.detail(`Parsed member: ${args.member}`);
      Logger.detail(`Message: ${message.url}`);
      Logger.detail(error.stack, true);
      message.util.send(messages.global.oops);
    }
  }
}

export default WarnCommand;

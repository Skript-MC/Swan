import { Argument, Command } from 'discord-akairo';
import { mute as config } from '../../../config/commands/moderation';
import messages from '../../../config/messages';
import settings from '../../../config/settings';
import ModerationData from '../../moderation/ModerationData';
import MuteAction from '../../moderation/actions/MuteAction';
import Logger from '../../structures/Logger';
import { constants, noop } from '../../utils';

class MuteCommand extends Command {
  constructor() {
    super('mute', {
      aliases: config.settings.aliases,
      description: { ...config.description },
      // TODO: Make it so arguments can be unordered
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
        id: 'duration',
        type: Argument.validate(
          'finiteDuration',
          (message, _phrase, value) => (message.member.roles.highest.id === settings.roles.forumModerator
            ? (value > 0 && value < settings.moderation)
            : true),
        ),
        prompt: {
          start: config.messages.promptStartDuration,
          retry: config.messages.promptRetryDuration,
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
    args.duration *= 1000;

    try {
      const data = new ModerationData(message)
        .setVictim(args.member)
        .setReason(args.reason)
        .setDuration(args.duration, true)
        .setType(constants.SANCTIONS.TYPES.MUTE);

      const success = await new MuteAction(data).commit();
      if (success)
        await message.util.send(config.messages.success).catch(noop);
    } catch (error) {
      Logger.error('An unexpected error occured while muting a member!');
      Logger.detail(`Duration: ${args.duration}`);
      Logger.detail(`Parsed member: ${args.member}`);
      Logger.detail(`Message: ${message.url}`);
      Logger.detail(error.stack, true);
      message.util.send(messages.global.oops);
    }
  }
}

export default MuteCommand;

import { Argument, Command } from 'discord-akairo';
import { ban as config } from '../../../config/commands/moderation';
import messages from '../../../config/messages';
import settings from '../../../config/settings';
import ModerationData from '../../moderation/ModerationData';
import BanAction from '../../moderation/actions/BanAction';
import Logger from '../../structures/Logger';
import { constants, noop } from '../../utils';

class BanCommand extends Command {
  constructor() {
    super('ban', {
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
          'duration',
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
      }, {
        id: 'autoban',
        match: 'flag',
        flag: ['--autoban', '--auto-ban', '-a'],
      }],
      clientPermissions: config.settings.clientPermissions,
      userPermissions: config.settings.userPermissions,
      channel: 'guild',
    });
  }

  async exec(message, args) {
    const data = new ModerationData(message)
      .setVictim(args.member)
      .setReason(args.reason);

    if (args.duration === -1) {
      data.setDuration(args.duration, false)
        .setType(constants.SANCTIONS.TYPES.HARDBAN);
    } else {
      args.duration *= 1000;
      data.setDuration(args.duration, true)
        .setInformations({ hasSentMessage: !args.autoban })
        .setType(constants.SANCTIONS.TYPES.BAN);
    }

    try {
      const success = await new BanAction(data).commit();
      if (success)
        await message.util.send(config.messages.success).catch(noop);
    } catch (error) {
      Logger.error('An unexpected error occured while banning a member!');
      Logger.detail(`Duration: ${args.duration}`);
      Logger.detail(`Parsed member: ${args.member}`);
      Logger.detail(`Autoban: ${args.autoban}`);
      Logger.detail(`Message: ${message.url}`);
      Logger.detail(error.stack, true);
      message.util.send(messages.global.oops);
    }
  }
}

export default BanCommand;

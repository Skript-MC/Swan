import { Argument, Command } from 'discord-akairo';
import { kick as config } from '../../../config/commands/moderation';
import messages from '../../../config/messages';
import ModerationData from '../../moderation/ModerationData';
import KickAction from '../../moderation/actions/KickAction';
import { constants } from '../../utils';

class KickCommand extends Command {
  constructor() {
    super('kick', {
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
    try {
      const data = new ModerationData(message)
        .setVictim(args.member)
        .setReason(args.reason)
        .setType(constants.SANCTIONS.TYPES.KICK);

      const success = await new KickAction(data).commit();
      if (success)
        await message.util.send(config.messages.success);
    } catch (error) {
      this.client.logger.error('An unexpected error occured while kicking a member!');
      this.client.logger.detail(`Parsed member: ${args.member}`);
      this.client.logger.detail(`Message: ${message.url}`);
      this.client.logger.detail(error.stack, true);
      message.util.send(messages.global.oops);
    }
  }
}

export default KickCommand;

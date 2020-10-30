import { Argument, Command } from 'discord-akairo';
import { GuildMember } from 'discord.js';
import { unban as config } from '../../../config/commands/moderation';
import messages from '../../../config/messages';
import ModerationData from '../../structures/ModerationData';
import ModerationHelper from '../../structures/ModerationHelper';
import UnbanAction from '../../structures/actions/UnbanAction';
import { constants } from '../../utils';

class UnbanCommand extends Command {
  constructor() {
    super('unban', {
      aliases: config.settings.aliases,
      description: { ...config.description },
      // TODO: Make it so arguments can be unordered
      args: [{
        id: 'member',
        // TODO: Make the validation of member here.
        // TODO: Also fetch the user, don't only take it from the cache (make a new custom type?)
        // TODO: Add a prompt
        type: Argument.union('member', 'user'),
      }, {
        id: 'reason',
        type: 'string',
        match: 'rest',
        default: messages.miscellaneous.noReason,
      }],
      clientPermissions: config.settings.clientPermissions,
      userPermissions: config.settings.userPermissions,
      channel: 'guild',
    });
  }

  async exec(message, args) {
    if (args.member instanceof GuildMember) {
      if (args.member.roles.highest.position >= message.member.roles.highest.position)
        // TODO: Change this message when the 3 TODO above are fixed
        return message.util.send('*[Le contenu du message est temporaire]* Le membre est invalide (il a des permissions supérieures ou égales aux vôtres), veuillez refaire la commande.');
    }

    // FIXME: This is really badly done, and will be fixed when all the TODO above are fixed.
    if (!args.member)
      args.member = await this.client.users.fetch(message.content.split(' ')[1]);
    if (!args.member)
      // TODO: Change this message when all the TODO above are fixed
      return message.util.send('*[Le contenu du message est temporaire]* Le membre est (impossible de le récupérer), veuillez refaire la commande.');

    try {
      const isBanned = await ModerationHelper.isBanned(args.member.id, true);
      if (!isBanned)
        return message.util.send(config.messages.notBanned);

      const data = new ModerationData(message)
        .setVictim(args.member, false)
        .setReason(args.reason)
        .setType(constants.SANCTIONS.TYPES.UNBAN);

      await new UnbanAction(data).commit();
      await message.util.send(config.messages.success);
    } catch (error) {
      this.client.logger.error('An error occured while unbanning a member!');
      this.client.logger.detail(`Parsed member: ${args.member}`);
      this.client.logger.detail(`Message: ${message.url}`);
      this.client.logger.error(error.stack);
      message.util.send(messages.global.oops);
    }
  }
}

export default UnbanCommand;

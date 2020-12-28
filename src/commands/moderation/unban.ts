import { Argument, Command } from 'discord-akairo';
import { GuildMember } from 'discord.js';
import { unban as config } from '../../../config/commands/moderation';
import messages from '../../../config/messages';
import ModerationData from '../../moderation/ModerationData';
import ModerationHelper from '../../moderation/ModerationHelper';
import UnbanAction from '../../moderation/actions/UnbanAction';
import Logger from '../../structures/Logger';
import { SanctionTypes } from '../../types';
import type { GuildMessage } from '../../types';
import type { UnbanCommandArgument } from '../../types/CommandArguments';
import { noop } from '../../utils';

class UnbanCommand extends Command {
  constructor() {
    super('unban', {
      aliases: config.settings.aliases,
      details: config.details,
      args: [{
        id: 'member',
        // TODO: Make the validation of member here, not in #exec().
        // TODO: Fetch the user, don't only take it from the cache (make a new custom type?).
        // TODO: Add a prompt (when the validation is done correctly).
        type: Argument.union('member', 'user'),
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

  public async exec(message: GuildMessage, args: UnbanCommandArgument): Promise<void> {
    if (args.member instanceof GuildMember
      && args.member.roles.highest.position >= message.member.roles.highest.position) {
      // TODO: Change this message and the next one when the 3 TODOs above are fixed.
      await message.util.send('*[Le contenu du message est temporaire]* Le membre est invalide (il a des permissions supérieures ou égales aux vôtres), veuillez refaire la commande.');
      return;
    }

    // NOTE: This is really badly done, but will be fixed when all the TODOs above are fixed.
    if (!args.member)
      args.member = await this.client.users.fetch(message.content.split(' ')[1]);
    if (!args.member) {
      await message.util.send('*[Le contenu du message est temporaire]* Le membre est (impossible de le récupérer), veuillez refaire la commande.');
      return;
    }

    try {
      const isBanned = await ModerationHelper.isBanned(args.member.id, true);
      if (!isBanned) {
        await message.util.send(config.messages.notBanned);
        return;
      }

      const data = new ModerationData(message)
        .setVictim(args.member, false)
        .setReason(args.reason)
        .setType(SanctionTypes.Unban);

      const success = await new UnbanAction(data).commit();
      if (success)
        await message.util.send(config.messages.success).catch(noop);
    } catch (unknownError: unknown) {
      Logger.error('An unexpected error occured while unbanning a member!');
      Logger.detail(`Parsed member: ${args.member}`);
      Logger.detail(`Message: ${message.url}`);
      Logger.detail((unknownError as Error).stack, true);
      await message.util.send(messages.global.oops).catch(noop);
    }
  }
}

export default UnbanCommand;

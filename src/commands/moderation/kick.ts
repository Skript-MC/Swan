import { Argument, Command } from 'discord-akairo';
import type { GuildMember } from 'discord.js';
import { kick as config } from '../../../config/commands/moderation';
import messages from '../../../config/messages';
import ModerationData from '../../moderation/ModerationData';
import KickAction from '../../moderation/actions/KickAction';
import Logger from '../../structures/Logger';
import { SanctionTypes } from '../../types';
import type { GuildMessage } from '../../types';
import type { KickCommandArgument } from '../../types/CommandArguments';
import { noop } from '../../utils';

class KickCommand extends Command {
  constructor() {
    super('kick', {
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

  public async exec(message: GuildMessage, args: KickCommandArgument): Promise<void> {
    try {
      const data = new ModerationData(message)
        .setVictim(args.member)
        .setReason(args.reason)
        .setType(SanctionTypes.Kick);

      const success = await new KickAction(data).commit();
      if (success)
        await message.channel.send(config.messages.success).catch(noop);
    } catch (unknownError: unknown) {
      Logger.error('An unexpected error occured while kicking a member!');
      Logger.detail(`Parsed member: ${args.member}`);
      Logger.detail(`Message: ${message.url}`);
      Logger.detail((unknownError as Error).stack, true);
      await message.channel.send(messages.global.oops).catch(noop);
    }
  }
}

export default KickCommand;

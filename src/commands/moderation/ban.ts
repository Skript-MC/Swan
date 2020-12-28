import { Argument, Command } from 'discord-akairo';
import type { GuildMember } from 'discord.js';
import { ban as config } from '../../../config/commands/moderation';
import messages from '../../../config/messages';
import settings from '../../../config/settings';
import ModerationData from '../../moderation/ModerationData';
import BanAction from '../../moderation/actions/BanAction';
import Logger from '../../structures/Logger';
import { SanctionTypes } from '../../types';
import type { GuildMessage } from '../../types';
import type { BanCommandArgument } from '../../types/CommandArguments';
import { noop } from '../../utils';

class BanCommand extends Command {
  constructor() {
    super('ban', {
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
        id: 'duration',
        type: Argument.validate(
          'duration',
          (message: GuildMessage, _phrase: string, value: number) => (
            message.member.roles.highest.id === settings.roles.forumModerator
            ? (value > 0 && value < settings.moderation.maximumDurationForumModerator)
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

  public async exec(message: GuildMessage, args: BanCommandArgument): Promise<void> {
    const data = new ModerationData(message)
      .setVictim(args.member)
      .setReason(args.reason);

    if (args.duration === -1) {
      data.setDuration(args.duration, false)
        .setType(SanctionTypes.Hardban);
    } else {
      args.duration *= 1000;
      data.setDuration(args.duration, true)
        .setInformations({ hasSentMessage: !args.autoban })
        .setType(SanctionTypes.Ban);
    }

    try {
      const success = await new BanAction(data).commit();
      if (success)
        await message.util.send(config.messages.success).catch(noop);
    } catch (unknownError: unknown) {
      Logger.error('An unexpected error occured while banning a member!');
      Logger.detail(`Duration: ${args.duration}`);
      Logger.detail(`Parsed member: ${args.member}`);
      Logger.detail(`Autoban: ${args.autoban}`);
      Logger.detail(`Message: ${message.url}`);
      Logger.detail((unknownError as Error).stack, true);
      await message.util.send(messages.global.oops).catch(noop);
    }
  }
}

export default BanCommand;

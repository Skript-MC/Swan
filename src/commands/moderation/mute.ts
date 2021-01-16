import { Argument, Command } from 'discord-akairo';
import type { GuildMember } from 'discord.js';
import { mute as config } from '../../../config/commands/moderation';
import messages from '../../../config/messages';
import settings from '../../../config/settings';
import ModerationData from '../../moderation/ModerationData';
import ModerationHelper from '../../moderation/ModerationHelper';
import MuteAction from '../../moderation/actions/MuteAction';
import Logger from '../../structures/Logger';
import { SanctionTypes } from '../../types';
import type { GuildMessage } from '../../types';
import type { MuteCommandArgument } from '../../types/CommandArguments';
import { noop } from '../../utils';

class MuteCommand extends Command {
  constructor() {
    super('mute', {
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
          'finiteDuration',
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
      }],
      clientPermissions: config.settings.clientPermissions,
      userPermissions: config.settings.userPermissions,
      channel: 'guild',
    });
  }

  public async exec(message: GuildMessage, args: MuteCommandArgument): Promise<void> {
    if (await ModerationHelper.isBanned(args.member.id)) {
      await message.util.send(messages.global.impossibleBecauseBanned).catch(noop);
      return;
    }

    args.duration *= 1000;

    try {
      const data = new ModerationData(message)
        .setVictim(args.member)
        .setReason(args.reason)
        .setDuration(args.duration, true)
        .setType(SanctionTypes.Mute);

      const success = await new MuteAction(data).commit();
      if (success)
        await message.util.send(config.messages.success).catch(noop);
    } catch (unknownError: unknown) {
      Logger.error('An unexpected error occured while muting a member!');
      Logger.detail(`Duration: ${args.duration}`);
      Logger.detail(`Parsed member: ${args.member}`);
      Logger.detail(`Message: ${message.url}`);
      Logger.detail((unknownError as Error).stack, true);
      await message.util.send(messages.global.oops).catch(noop);
    }
  }
}

export default MuteCommand;
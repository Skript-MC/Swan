import { Argument, Command } from 'discord-akairo';
import type { GuildMember } from 'discord.js';
import ModerationData from '@/app/moderation/ModerationData';
import ModerationHelper from '@/app/moderation/ModerationHelper';
import WarnAction from '@/app/moderation/actions/WarnAction';
import Logger from '@/app/structures/Logger';
import { SanctionTypes } from '@/app/types';
import type { GuildMessage } from '@/app/types';
import type { WarnCommandArgument } from '@/app/types/CommandArguments';
import { noop } from '@/app/utils';
import { warn as config } from '@/conf/commands/moderation';
import messages from '@/conf/messages';
import settings from '@/conf/settings';

class WarnCommand extends Command {
  constructor() {
    super('warn', {
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

  public async exec(message: GuildMessage, args: WarnCommandArgument): Promise<void> {
    if (this.client.currentlyModerating.includes(args.member.id)) {
      await message.channel.send(messages.moderation.alreadyModerated).catch(noop);
      return;
    }

    this.client.currentlyModerating.push(args.member.id);
    setTimeout(() => {
      this.client.currentlyModerating.splice(this.client.currentlyModerating.indexOf(args.member.id), 1);
    }, 10_000);

    const isBanned = await ModerationHelper.isBanned(args.member.id);
    if (isBanned) {
      await message.channel.send(messages.global.impossibleBecauseBanned).catch(noop);
      return;
    }

    try {
      const data = new ModerationData(message)
        .setVictim(args.member)
        .setReason(args.reason)
        .setDuration(settings.moderation.warnDuration * 1000, true)
        .setType(SanctionTypes.Warn);

      const success = await new WarnAction(data).commit();
      if (success)
        await message.channel.send(config.messages.success).catch(noop);
    } catch (unknownError: unknown) {
      Logger.error('An unexpected error occurred while warning a member!');
      Logger.detail(`Parsed member: ${args.member}`);
      Logger.detail(`Message: ${message.url}`);
      Logger.detail((unknownError as Error).stack, true);
      await message.channel.send(messages.global.oops).catch(noop);
    }
  }
}

export default WarnCommand;

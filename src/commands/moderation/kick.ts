import { Argument, Command } from 'discord-akairo';
import type { GuildMember } from 'discord.js';
import ModerationData from '@/app/moderation/ModerationData';
import KickAction from '@/app/moderation/actions/KickAction';
import Logger from '@/app/structures/Logger';
import { SanctionTypes } from '@/app/types';
import type { GuildMessage } from '@/app/types';
import type { KickCommandArgument } from '@/app/types/CommandArguments';
import { noop } from '@/app/utils';
import { kick as config } from '@/conf/commands/moderation';
import messages from '@/conf/messages';

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
    if (this.client.currentlyModerating.includes(args.member.id)) {
      await message.channel.send(messages.moderation.alreadyModerated).catch(noop);
      return;
    }

    this.client.currentlyModerating.push(args.member.id);
    setTimeout(() => {
      this.client.currentlyModerating.splice(this.client.currentlyModerating.indexOf(args.member.id), 1);
    }, 10_000);

    try {
      const data = new ModerationData(message)
        .setVictim(args.member)
        .setReason(args.reason)
        .setType(SanctionTypes.Kick);

      const success = await new KickAction(data).commit();
      if (success)
        await message.channel.send(config.messages.success).catch(noop);
    } catch (unknownError: unknown) {
      Logger.error('An unexpected error occurred while kicking a member!');
      Logger.detail(`Parsed member: ${args.member}`);
      Logger.detail(`Message: ${message.url}`);
      Logger.detail((unknownError as Error).stack, true);
      await message.channel.send(messages.global.oops).catch(noop);
    }
  }
}

export default KickCommand;

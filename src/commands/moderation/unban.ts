import { Argument, Command } from 'discord-akairo';
import type { GuildMember, User } from 'discord.js';
import ModerationData from '@/app/moderation/ModerationData';
import ModerationHelper from '@/app/moderation/ModerationHelper';
import UnbanAction from '@/app/moderation/actions/UnbanAction';
import Logger from '@/app/structures/Logger';
import { SanctionTypes } from '@/app/types';
import type { GuildMessage } from '@/app/types';
import type { UnbanCommandArgument } from '@/app/types/CommandArguments';
import { noop, nullop } from '@/app/utils';
import { unban as config } from '@/conf/commands/moderation';
import messages from '@/conf/messages';

class UnbanCommand extends Command {
  constructor() {
    super('unban', {
      aliases: config.settings.aliases,
      details: config.details,
      args: [{
        id: 'member',
        type: Argument.union(
          // Try resolving to a GuildMember
          'member',
          // Try resolving to a User
          'user',
          // Try resolving the first part of the message (possibly the name/ID of the victim) to a User
          (_message, value) => this.client.util.resolveUser(value, this.client.users.cache),
          // Try parsing the first part of the message to an ID
          async (message: GuildMessage, value: string) => {
            let resolvedMember: GuildMember | User;
            const id = /<@!?(?<id>\d{17,19})>/.exec(value)?.groups?.id
              || /(?<id>\d{17,19})/.exec(value)?.groups?.id;
            // If we found a valid ID, try resolving the User from cache
            if (id) {
              resolvedMember = this.client.util.resolveUser(id, this.client.users.cache)
                // If it is not found in the cache, try fetching it
                || await this.client.users.fetch(id).catch(noop)
                // If we failed to fetch it, look in the Discord's bans
                || (await message.guild.fetchBan(id).catch(nullop))?.user
                || null;
            }
            return resolvedMember;
          },
        ),
        prompt: {
          start: config.messages.promptStartMember,
          retry: config.messages.promptRetryMember,
        },
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
    if (this.client.currentlyModerating.includes(args.member.id)) {
      await message.channel.send(messages.moderation.alreadyModerated).catch(noop);
      return;
    }

    this.client.currentlyModerating.push(args.member.id);
    setTimeout(() => {
      this.client.currentlyModerating.splice(this.client.currentlyModerating.indexOf(args.member.id), 1);
    }, 10_000);

    try {
      const isBanned = await ModerationHelper.isBanned(args.member.id, true);
      if (!isBanned) {
        await message.channel.send(config.messages.notBanned);
        return;
      }

      const data = new ModerationData(message)
        .setVictim(args.member, false)
        .setReason(args.reason)
        .setType(SanctionTypes.Unban);

      const success = await new UnbanAction(data).commit();
      if (success)
        await message.channel.send(config.messages.success).catch(noop);
    } catch (unknownError: unknown) {
      Logger.error('An unexpected error occurred while unbanning a member!');
      Logger.detail(`Parsed member: ${args.member}`);
      Logger.detail(`Message: ${message.url}`);
      Logger.detail((unknownError as Error).stack, true);
      await message.channel.send(messages.global.oops).catch(noop);
    }
  }
}

export default UnbanCommand;

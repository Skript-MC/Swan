import { ApplyOptions } from '@sapphire/decorators';
import { UserOrMemberMentionRegex } from '@sapphire/discord-utilities';
import type { Args, Result, UserError } from '@sapphire/framework';
import { ok } from '@sapphire/framework';
import type { GuildMember, User } from 'discord.js';
import ModerationData from '@/app/moderation/ModerationData';
import ModerationHelper from '@/app/moderation/ModerationHelper';
import UnbanAction from '@/app/moderation/actions/UnbanAction';
import SwanCommand from '@/app/structures/commands/SwanCommand';
import { SanctionTypes } from '@/app/types';
import type { GuildMessage, SwanCommandOptions } from '@/app/types';
import { noop, nullop, resolveUser } from '@/app/utils';
import { unban as config } from '@/conf/commands/moderation';
import messages from '@/conf/messages';
import settings from '@/conf/settings';

@ApplyOptions<SwanCommandOptions>({ ...settings.globalCommandsOptions, ...config.settings })
export default class UnbanCommand extends SwanCommand {
  // [{
  //   id: 'member',
  //   type: Argument.union(
  //     // Try resolving to a GuildMember
  //     'member',
  //     // Try resolving to a User
  //     'user',
  //     // Try resolving the first part of the message (possibly the name/ID of the victim) to a User
  //     (_message, value) => this.client.util.resolveUser(value, this.client.users.cache),
  //     // Try parsing the first part of the message to an ID
  //     async (message: GuildMessage, value: string) => {
  //       let resolvedMember: GuildMember | User | undefined;
  //       const id = /<@!?(?<id>\d{17,19})>/.exec(value)?.groups?.id
  //         || /(?<id>\d{17,19})/.exec(value)?.groups?.id;
  //       // If we found a valid ID, try resolving the User from cache
  //       if (id) {
  //         resolvedMember = this.client.util.resolveUser(id, this.client.users.cache)
  //           // If it is not found in the cache, try fetching it
  //           || await this.client.users.fetch(id).catch(noop)
  //           // If we failed to fetch it, look in the Discord's bans
  //           || (await message.guild.fetchBan(id).catch(nullop))?.user
  //           || null;
  //       }
  //       return resolvedMember;
  //     },
  //   ),
  //   prompt: {
  //     start: config.messages.promptStartMember,
  //     retry: config.messages.promptRetryMember,
  //   },
  // }, {
  //   id: 'reason',
  //   type: 'string',
  //   match: 'rest',
  //   default: messages.global.noReason,
  // }],

  public async run(message: GuildMessage, args: Args): Promise<void> {
    const member = await this._getMember(message, args);
    if (member.error)
      return void await message.channel.send(config.messages.promptRetryMember);

    const reason = (await args.restResult('string'))?.value ?? messages.global.noReason;

    if (this.context.client.currentlyModerating.has(member.value.id)) {
      await message.channel.send(messages.moderation.alreadyModerated).catch(noop);
      return;
    }

    this.context.client.currentlyModerating.add(member.value.id);
    setTimeout(() => {
      this.context.client.currentlyModerating.delete(member.value.id);
    }, 10_000);

    try {
      const isBanned = await ModerationHelper.isBanned(member.value.id, true);
      if (!isBanned) {
        await message.channel.send(config.messages.notBanned);
        return;
      }

      const data = new ModerationData(message)
        .setVictim(member.value, false)
        .setReason(reason)
        .setType(SanctionTypes.Unban);

      const success = await new UnbanAction(data).commit();
      if (success)
        await message.channel.send(config.messages.success).catch(noop);
    } catch (unknownError: unknown) {
      this.context.logger.error('An unexpected error occurred while unbanning a member!');
      this.context.logger.info(`Parsed member: ${member.value}`);
      this.context.logger.info(`Message: ${message.url}`);
      this.context.logger.info((unknownError as Error).stack, true);
      await message.channel.send(messages.global.oops).catch(noop);
    }
  }

  private async _getMember(message: GuildMessage, args: Args): Promise<Result<GuildMember | User, UserError>> {
    const paramString = await args.peekResult('string');

    const member = await args.pickResult('member');
    if (member.success)
      return member;

    const user = await args.pickResult('user');
    if (user.success)
      return user;

    let resolvedUser = resolveUser(paramString.value);
    if (resolvedUser)
      return ok(resolvedUser);

    const id = UserOrMemberMentionRegex.exec(paramString.value)?.groups?.id
      || /(?<id>\d{17,19})/.exec(paramString.value)?.groups?.id;
    // If we found a valid ID, try resolving the User from cache
    if (id) {
      resolvedUser = resolveUser(id)
        // If it is not found in the cache, try fetching it
        || await this.context.client.users.fetch(id).catch(noop)
        // If we failed to fetch it, look in the Discord's bans
        || (await message.guild.fetchBan(id).catch(nullop))?.user
        || null;
      if (resolvedUser)
        return ok(resolvedUser);
    }
    return null;
  }
}

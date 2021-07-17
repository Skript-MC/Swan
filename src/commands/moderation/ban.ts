import { ApplyOptions } from '@sapphire/decorators';
import type { Args, Result, UserError } from '@sapphire/framework';
import { err } from '@sapphire/framework';
import ModerationData from '@/app/moderation/ModerationData';
import BanAction from '@/app/moderation/actions/BanAction';
import SwanCommand from '@/app/structures/commands/SwanCommand';
import { SanctionTypes } from '@/app/types';
import type { GuildMessage, SwanCommandOptions } from '@/app/types';
import { noop } from '@/app/utils';
import { ban as config } from '@/conf/commands/moderation';
import messages from '@/conf/messages';
import settings from '@/conf/settings';

const autobanFlags = ['a', 'auto', 'auto-ban', 'autoban'];
const purgeFlags = ['p', 'purge'];

@ApplyOptions<SwanCommandOptions>({
  ...settings.globalCommandsOptions,
  ...config.settings,
  strategyOptions: {
    flags: [...autobanFlags, ...purgeFlags],
  },
})
export default class BanCommand extends SwanCommand {
  // [{
  //   id: 'member',
  //   type: Argument.validate(
  //     'member',
  //     (message: GuildMessage, _phrase: string, value: GuildMember) => value.id !== message.author.id
  //       && value.roles.highest.position < message.member.roles.highest.position,
  //   ),
  //   prompt: {
  //     start: config.messages.promptStartMember,
  //     retry: config.messages.promptRetryMember,
  //   },
  // }, {
  //   id: 'duration',
  //   type: Argument.validate(
  //     'duration',
  //     (message: GuildMessage, _phrase: string, value: number) => (
  //       message.member.roles.highest.id === settings.roles.forumModerator
  //       ? (value > 0 && value < settings.moderation.maximumDurationForumModerator)
  //       : true),
  //   ),
  //   prompt: {
  //     start: config.messages.promptStartDuration,
  //     retry: config.messages.promptRetryDuration,
  //   },
  // }, {
  //   id: 'reason',
  //   type: 'string',
  //   match: 'rest',
  //   prompt: {
  //     start: config.messages.promptStartReason,
  //     retry: config.messages.promptRetryReason,
  //   },
  // }, {
  //   id: 'autoban',
  //   match: 'flag',
  //   flag: ['--autoban', '--auto-ban', '-a'],
  // }, {
  //   id: 'purge',
  //   match: 'flag',
  //   flag: ['--purge', '-p'],
  // }],

  public async run(message: GuildMessage, args: Args): Promise<void> {
    const member = await args.pickResult('sanctionnableMember');
    if (member.error)
      return void await message.channel.send(config.messages.promptRetryMember);

    const duration = await this._getDuration(message, args);
    if (duration.error)
      return void await message.channel.send(config.messages.promptRetryDuration);

    const autoban = args.getFlags(...autobanFlags);
    const purge = args.getFlags(...purgeFlags);

    const reason = await args.restResult('string');
    if (reason.error)
      return void await message.channel.send(config.messages.promptRetryReason);

    if (this.context.client.currentlyModerating.has(member.value.id)) {
      await message.channel.send(messages.moderation.alreadyModerated).catch(noop);
      return;
    }

    this.context.client.currentlyModerating.add(member.value.id);
    setTimeout(() => {
      this.context.client.currentlyModerating.delete(member.value.id);
    }, 10_000);

    const data = new ModerationData(message)
      .setVictim(member.value)
      .setReason(reason.value)
      .setShouldPurge(purge);

    if (duration.value === -1) {
      data.setDuration(duration.value, false)
        .setType(SanctionTypes.Hardban);
    } else {
      data.setDuration(duration.value, true)
        .setInformations({ shouldAutobanIfNoMessages: autoban })
        .setType(SanctionTypes.Ban);
    }

    try {
      const success = await new BanAction(data).commit();
      if (success)
        await message.channel.send(config.messages.success).catch(noop);
    } catch (unknownError: unknown) {
      this.context.logger.error('An unexpected error occurred while banning a member!');
      this.context.logger.info(`Duration: ${duration.value}`);
      this.context.logger.info(`Parsed member: ${member.value}`);
      this.context.logger.info(`Autoban: ${autoban}`);
      this.context.logger.info(`Message: ${message.url}`);
      this.context.logger.info((unknownError as Error).stack, true);
      await message.channel.send(messages.global.oops).catch(noop);
    }
  }

  private async _getDuration(message: GuildMessage, args: Args): Promise<Result<number, UserError>> {
    const duration = await args.pickResult('duration');

    if (message.member.roles.highest.id === settings.roles.forumModerator
      && (duration.value < 0 || duration.value > settings.moderation.maximumDurationForumModerator)) {
      const argument = this.context.stores.get('arguments').get('duration');
      return err({
        argument,
        parameter: duration.value.toString(),
        name: argument.name,
        identifier: argument.name,
        message: 'Duration exceeded your limit.',
        context: argument.context,
      });
    }

    return duration;
  }
}

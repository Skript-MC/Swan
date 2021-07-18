import { ApplyOptions } from '@sapphire/decorators';
import Arguments from '@/app/decorators/Arguments';
import ModerationData from '@/app/moderation/ModerationData';
import BanAction from '@/app/moderation/actions/BanAction';
import SwanCommand from '@/app/structures/commands/SwanCommand';
import { GuildMessage, SanctionTypes } from '@/app/types';
import type { SwanCommandOptions } from '@/app/types';
import { BanCommandArgument } from '@/app/types/CommandArguments';
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
  @Arguments({
    name: 'autoban',
    match: 'flag',
    flags: autobanFlags,
  }, {
    name: 'purge',
    match: 'flag',
    flags: purgeFlags,
  }, {
    name: 'member',
    match: 'pick',
    type: 'sanctionnableMember',
    required: true,
    message: config.messages.promptRetryMember,
  }, {
    name: 'duration',
    match: 'pick',
    type: 'duration',
    validate: (message, resolved: number) => (message.member.roles.highest.id === settings.roles.forumModerator
      ? (resolved > 0 && resolved < settings.moderation.maximumDurationForumModerator)
      : true),
    required: true,
    message: config.messages.promptRetryDuration,
  }, {
    name: 'reason',
    match: 'rest',
    type: 'string',
    required: true,
    message: config.messages.promptRetryReason,
  })
  // @ts-expect-error ts(2416)
  public override async run(message: GuildMessage, args: BanCommandArgument): Promise<void> {
    if (this.context.client.currentlyModerating.has(args.member.id)) {
      await message.channel.send(messages.moderation.alreadyModerated).catch(noop);
      return;
    }

    this.context.client.currentlyModerating.add(args.member.id);
    setTimeout(() => {
      this.context.client.currentlyModerating.delete(args.member.id);
    }, 10_000);

    const data = new ModerationData(message)
      .setVictim(args.member)
      .setReason(args.reason)
      .setShouldPurge(args.purge);

    if (args.duration === -1) {
      data.setDuration(args.duration, false)
        .setType(SanctionTypes.Hardban);
    } else {
      data.setDuration(args.duration, true)
        .setInformations({ shouldAutobanIfNoMessages: args.autoban })
        .setType(SanctionTypes.Ban);
    }

    try {
      const success = await new BanAction(data).commit();
      if (success)
        await message.channel.send(config.messages.success).catch(noop);
    } catch (unknownError: unknown) {
      this.context.logger.error('An unexpected error occurred while banning a member!');
      this.context.logger.info(`Duration: ${args.duration}`);
      this.context.logger.info(`Parsed member: ${args.member}`);
      this.context.logger.info(`Autoban: ${args.autoban}`);
      this.context.logger.info(`Message: ${message.url}`);
      this.context.logger.info((unknownError as Error).stack, true);
      await message.channel.send(messages.global.oops).catch(noop);
    }
  }
}

import { ApplyOptions } from '@sapphire/decorators';
import Arguments from '@/app/decorators/Argument';
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

const autobanFlags = ['--autoban', '--auto-ban', '-a'];
const purgeFlags = ['--purge', '-p'];

@ApplyOptions<SwanCommandOptions>({
  ...settings.globalCommandsOptions,
  ...config.settings,
  flags: [autobanFlags, purgeFlags].flat(),
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
    type: 'sanctionnableMember',
    match: 'pick',
    required: true,
    message: messages.prompt.member,
  }, {
    name: 'duration',
    type: 'duration',
    match: 'pick',
    validate: (message, resolved: number) => (message.member.roles.highest.id === settings.roles.forumModerator
      ? (resolved > 0 && resolved < settings.moderation.maximumDurationForumModerator)
      : true),
    required: true,
    message: messages.prompt.duration,
  }, {
    name: 'reason',
    type: 'string',
    match: 'rest',
    required: true,
    message: messages.prompt.reason,
  })
  // @ts-expect-error ts(2416)
  public override async messageRun(message: GuildMessage, args: BanCommandArgument): Promise<void> {
    if (this.container.client.currentlyModerating.has(args.member.id)) {
      await message.channel.send(messages.moderation.alreadyModerated).catch(noop);
      return;
    }

    this.container.client.currentlyModerating.add(args.member.id);
    setTimeout(() => {
      this.container.client.currentlyModerating.delete(args.member.id);
    }, 10_000);

    const data = new ModerationData(message)
      .setVictim(args.member)
      .setReason(args.reason)
      .setShouldPurge(args.purge);

    if (args.duration === -1) {
      data.setDuration(args.duration, false)
        .setType(SanctionTypes.Hardban);
    } else {
      args.duration *= 1000;
      data.setDuration(args.duration, true)
        .setInformations({ shouldAutobanIfNoMessages: args.autoban })
        .setType(SanctionTypes.Ban);
    }

    try {
      const success = await new BanAction(data).commit();
      if (success)
        await message.channel.send(config.messages.success).catch(noop);
    } catch (unknownError: unknown) {
      this.container.logger.error('An unexpected error occurred while banning a member!');
      this.container.logger.info(`Duration: ${args.duration}`);
      this.container.logger.info(`Parsed member: ${args.member}`);
      this.container.logger.info(`Autoban: ${args.autoban}`);
      this.container.logger.info(`Message: ${message.url}`);
      this.container.logger.info((unknownError as Error).stack, true);
      await message.channel.send(messages.global.oops).catch(noop);
    }
  }
}

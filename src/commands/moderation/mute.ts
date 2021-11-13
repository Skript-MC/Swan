import { ApplyOptions } from '@sapphire/decorators';
import Arguments from '@/app/decorators/Argument';
import ModerationData from '@/app/moderation/ModerationData';
import ModerationHelper from '@/app/moderation/ModerationHelper';
import MuteAction from '@/app/moderation/actions/MuteAction';
import SwanCommand from '@/app/structures/commands/SwanCommand';
import { GuildMessage, SanctionTypes } from '@/app/types';
import type { SwanCommandOptions } from '@/app/types';
import { MuteCommandArgument } from '@/app/types/CommandArguments';
import { noop } from '@/app/utils';
import { mute as config } from '@/conf/commands/moderation';
import messages from '@/conf/messages';
import settings from '@/conf/settings';

@ApplyOptions<SwanCommandOptions>({ ...settings.globalCommandsOptions, ...config.settings })
export default class MuteCommand extends SwanCommand {
  @Arguments({
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
  public override async messageRun(message: GuildMessage, args: MuteCommandArgument): Promise<void> {
    if (this.container.client.currentlyModerating.has(args.member.id)) {
      await message.channel.send(messages.moderation.alreadyModerated).catch(noop);
      return;
    }

    this.container.client.currentlyModerating.add(args.member.id);
    setTimeout(() => {
      this.container.client.currentlyModerating.delete(args.member.id);
    }, 10_000);

    if (await ModerationHelper.isBanned(args.member.id)) {
      await message.channel.send(messages.global.impossibleBecauseBanned).catch(noop);
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
        await message.channel.send(config.messages.success).catch(noop);
    } catch (unknownError: unknown) {
      this.container.logger.error('An unexpected error occurred while muting a member!');
      this.container.logger.info(`Duration: ${args.duration}`);
      this.container.logger.info(`Parsed member: ${args.member}`);
      this.container.logger.info(`Message: ${message.url}`);
      this.container.logger.info((unknownError as Error).stack, true);
      await message.channel.send(messages.global.oops).catch(noop);
    }
  }
}

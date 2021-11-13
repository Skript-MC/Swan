import { ApplyOptions } from '@sapphire/decorators';
import Arguments from '@/app/decorators/Argument';
import ModerationData from '@/app/moderation/ModerationData';
import ModerationHelper from '@/app/moderation/ModerationHelper';
import WarnAction from '@/app/moderation/actions/WarnAction';
import SwanCommand from '@/app/structures/commands/SwanCommand';
import { GuildMessage, SanctionTypes } from '@/app/types';
import type { SwanCommandOptions } from '@/app/types';
import { WarnCommandArgument } from '@/app/types/CommandArguments';
import { noop } from '@/app/utils';
import { warn as config } from '@/conf/commands/moderation';
import messages from '@/conf/messages';
import settings from '@/conf/settings';

@ApplyOptions<SwanCommandOptions>({ ...settings.globalCommandsOptions, ...config.settings })
export default class WarnCommand extends SwanCommand {
  @Arguments({
    name: 'member',
    type: 'member',
    match: 'pick',
    required: true,
    message: messages.prompt.member,
  }, {
    name: 'reason',
    type: 'string',
    match: 'rest',
    required: true,
    message: messages.prompt.reason,
  })
  // @ts-expect-error ts(2416)
  public override async messageRun(message: GuildMessage, args: WarnCommandArgument): Promise<void> {
    if (this.container.client.currentlyModerating.has(args.member.id)) {
      await message.channel.send(messages.moderation.alreadyModerated).catch(noop);
      return;
    }

    this.container.client.currentlyModerating.add(args.member.id);
    setTimeout(() => {
      this.container.client.currentlyModerating.delete(args.member.id);
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
      this.container.logger.error('An unexpected error occurred while warning a member!');
      this.container.logger.info(`Parsed member: ${args.member}`);
      this.container.logger.info(`Message: ${message.url}`);
      this.container.logger.info((unknownError as Error).stack, true);
      await message.channel.send(messages.global.oops).catch(noop);
    }
  }
}

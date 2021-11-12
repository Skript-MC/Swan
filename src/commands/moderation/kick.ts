import { ApplyOptions } from '@sapphire/decorators';
import Arguments from '@/app/decorators/Argument';
import ModerationData from '@/app/moderation/ModerationData';
import KickAction from '@/app/moderation/actions/KickAction';
import SwanCommand from '@/app/structures/commands/SwanCommand';
import { GuildMessage, SanctionTypes } from '@/app/types';
import type { SwanCommandOptions } from '@/app/types';
import { KickCommandArgument } from '@/app/types/CommandArguments';
import { noop } from '@/app/utils';
import { kick as config } from '@/conf/commands/moderation';
import messages from '@/conf/messages';
import settings from '@/conf/settings';

@ApplyOptions<SwanCommandOptions>({ ...settings.globalCommandsOptions, ...config.settings })
export default class KickCommand extends SwanCommand {
  @Arguments({
    name: 'member',
    type: 'sanctionnableMember',
    match: 'pick',
    required: true,
    message: config.messages.promptRetryMember,
  }, {
    name: 'reason',
    type: 'string',
    match: 'rest',
    required: true,
    message: config.messages.promptRetryReason,
  })
  // @ts-expect-error ts(2416)
  public override async messageRun(message: GuildMessage, args: KickCommandArgument): Promise<void> {
    if (this.container.client.currentlyModerating.has(args.member.id)) {
      await message.channel.send(messages.moderation.alreadyModerated).catch(noop);
      return;
    }

    this.container.client.currentlyModerating.add(args.member.id);
    setTimeout(() => {
      this.container.client.currentlyModerating.delete(args.member.id);
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
      this.container.logger.error('An unexpected error occurred while kicking a member!');
      this.container.logger.info(`Parsed member: ${args.member}`);
      this.container.logger.info(`Message: ${message.url}`);
      this.container.logger.info((unknownError as Error).stack, true);
      await message.channel.send(messages.global.oops).catch(noop);
    }
  }
}

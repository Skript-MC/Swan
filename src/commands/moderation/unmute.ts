import { ApplyOptions } from '@sapphire/decorators';
import Arguments from '@/app/decorators/Argument';
import ConvictedUser from '@/app/models/convictedUser';
import ModerationData from '@/app/moderation/ModerationData';
import UnmuteAction from '@/app/moderation/actions/UnmuteAction';
import SwanCommand from '@/app/structures/commands/SwanCommand';
import { GuildMessage, SanctionTypes } from '@/app/types';
import type { SwanCommandOptions } from '@/app/types';
import { UnmuteCommandArgument } from '@/app/types/CommandArguments';
import { noop } from '@/app/utils';
import { unmute as config } from '@/conf/commands/moderation';
import messages from '@/conf/messages';
import settings from '@/conf/settings';

@ApplyOptions<SwanCommandOptions>({ ...settings.globalCommandsOptions, ...config.settings })
export default class UnmuteCommand extends SwanCommand {
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
    default: messages.global.noReason,
  })
  // @ts-expect-error ts(2416)
  public override async messageRun(message: GuildMessage, args: UnmuteCommandArgument): Promise<void> {
    if (this.container.client.currentlyModerating.has(args.member.id)) {
      await message.channel.send(messages.moderation.alreadyModerated).catch(noop);
      return;
    }

    this.container.client.currentlyModerating.add(args.member.id);
    setTimeout(() => {
      this.container.client.currentlyModerating.delete(args.member.id);
    }, 10_000);

    try {
      const convictedUser = await ConvictedUser.findOne({ memberId: args.member.id });
      if (!convictedUser?.currentMuteId) {
        await message.channel.send(config.messages.notMuted);
        return;
      }

      const data = new ModerationData(message)
        .setVictim(args.member)
        .setReason(args.reason)
        .setType(SanctionTypes.Unmute);

      const success = await new UnmuteAction(data).commit();
      if (success)
        await message.channel.send(config.messages.success).catch(noop);
    } catch (unknownError: unknown) {
      this.container.logger.error('An unexpected error occurred while unmuting a member!');
      this.container.logger.info(`Parsed member: ${args.member}`);
      this.container.logger.info(`Message: ${message.url}`);
      this.container.logger.info((unknownError as Error).stack, true);
      await message.channel.send(messages.global.oops).catch(noop);
    }
  }
}

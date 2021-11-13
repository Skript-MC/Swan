import { ApplyOptions } from '@sapphire/decorators';
import Arguments from '@/app/decorators/Argument';
import ModerationData from '@/app/moderation/ModerationData';
import ModerationHelper from '@/app/moderation/ModerationHelper';
import UnbanAction from '@/app/moderation/actions/UnbanAction';
import SwanCommand from '@/app/structures/commands/SwanCommand';
import { GuildMessage, SanctionTypes } from '@/app/types';
import type { SwanCommandOptions } from '@/app/types';
import { UnbanCommandArgument } from '@/app/types/CommandArguments';
import { noop } from '@/app/utils';
import { unban as config } from '@/conf/commands/moderation';
import messages from '@/conf/messages';
import settings from '@/conf/settings';

@ApplyOptions<SwanCommandOptions>({ ...settings.globalCommandsOptions, ...config.settings })
export default class UnbanCommand extends SwanCommand {
  @Arguments({
    name: 'member',
    type: 'bannedMember',
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
  public override async messageRun(message: GuildMessage, args: UnbanCommandArgument): Promise<void> {
    if (this.container.client.currentlyModerating.has(args.member.id)) {
      await message.channel.send(messages.moderation.alreadyModerated).catch(noop);
      return;
    }

    this.container.client.currentlyModerating.add(args.member.id);
    setTimeout(() => {
      this.container.client.currentlyModerating.delete(args.member.id);
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
      this.container.logger.error('An unexpected error occurred while unbanning a member!');
      this.container.logger.info(`Parsed member: ${args.member}`);
      this.container.logger.info(`Message: ${message.url}`);
      this.container.logger.info((unknownError as Error).stack, true);
      await message.channel.send(messages.global.oops).catch(noop);
    }
  }
}

import { ApplyOptions } from '@sapphire/decorators';
import type { Args } from '@sapphire/framework';
import ConvictedUser from '@/app/models/convictedUser';
import ModerationData from '@/app/moderation/ModerationData';
import UnmuteAction from '@/app/moderation/actions/UnmuteAction';
import SwanCommand from '@/app/structures/commands/SwanCommand';
import { SanctionTypes } from '@/app/types';
import type { GuildMessage, SwanCommandOptions } from '@/app/types';
import { noop } from '@/app/utils';
import { unmute as config } from '@/conf/commands/moderation';
import messages from '@/conf/messages';
import settings from '@/conf/settings';

@ApplyOptions<SwanCommandOptions>({ ...settings.globalCommandsOptions, ...config.settings })
export default class UnmuteCommand extends SwanCommand {
  // [{
  //   id: 'member',
  //   type: Argument.validate(
  //     'member',
  //     (message: GuildMessage, _phrase: string, value: GuildMember) => value.id !== message.author.id
  //       && value.roles.highest.position < message.member.value.roles.highest.position,
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
    const member = await args.pickResult('sanctionnableMember');
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
      const convictedUser = await ConvictedUser.findOne({ memberId: member.value.id });
      if (!convictedUser?.currentMuteId) {
        await message.channel.send(config.messages.notMuted);
        return;
      }

      const data = new ModerationData(message)
        .setVictim(member.value)
        .setReason(reason)
        .setType(SanctionTypes.Unmute);

      const success = await new UnmuteAction(data).commit();
      if (success)
        await message.channel.send(config.messages.success).catch(noop);
    } catch (unknownError: unknown) {
      this.context.logger.error('An unexpected error occurred while unmuting a member!');
      this.context.logger.info(`Parsed member: ${member.value}`);
      this.context.logger.info(`Message: ${message.url}`);
      this.context.logger.info((unknownError as Error).stack, true);
      await message.channel.send(messages.global.oops).catch(noop);
    }
  }
}

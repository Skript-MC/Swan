import { ApplyOptions } from '@sapphire/decorators';
import type { Args } from '@sapphire/framework';
import ModerationData from '@/app/moderation/ModerationData';
import KickAction from '@/app/moderation/actions/KickAction';
import SwanCommand from '@/app/structures/commands/SwanCommand';
import { SanctionTypes } from '@/app/types';
import type { GuildMessage, SwanCommandOptions } from '@/app/types';
import { noop } from '@/app/utils';
import { kick as config } from '@/conf/commands/moderation';
import messages from '@/conf/messages';
import settings from '@/conf/settings';

@ApplyOptions<SwanCommandOptions>({ ...settings.globalCommandsOptions, ...config.settings })
export default class KickCommand extends SwanCommand {
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
  //   id: 'reason',
  //   type: 'string',
  //   match: 'rest',
  //   prompt: {
  //     start: config.messages.promptStartReason,
  //     retry: config.messages.promptRetryReason,
  //   },
  // }],

  public override async run(message: GuildMessage, args: Args): Promise<void> {
    const member = await args.pickResult('sanctionnableMember');
    if (member.error)
      return void await message.channel.send(config.messages.promptRetryMember);

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

    try {
      const data = new ModerationData(message)
        .setVictim(member.value)
        .setReason(reason.value)
        .setType(SanctionTypes.Kick);

      const success = await new KickAction(data).commit();
      if (success)
        await message.channel.send(config.messages.success).catch(noop);
    } catch (unknownError: unknown) {
      this.context.logger.error('An unexpected error occurred while kicking a member!');
      this.context.logger.info(`Parsed member: ${member.value}`);
      this.context.logger.info(`Message: ${message.url}`);
      this.context.logger.info((unknownError as Error).stack, true);
      await message.channel.send(messages.global.oops).catch(noop);
    }
  }
}

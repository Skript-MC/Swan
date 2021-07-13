import { ApplyOptions } from '@sapphire/decorators';
import type { Args } from '@sapphire/framework';
import ConvictedUser from '@/app/models/convictedUser';
import Sanction from '@/app/models/sanction';
import ModerationData from '@/app/moderation/ModerationData';
import RemoveWarnAction from '@/app/moderation/actions/RemoveWarnAction';
import SwanCommand from '@/app/structures/commands/SwanCommand';
import { SanctionTypes } from '@/app/types';
import type { GuildMessage, SwanCommandOptions } from '@/app/types';
import { noop, nullop } from '@/app/utils';
import { removeWarn as config } from '@/conf/commands/moderation';
import messages from '@/conf/messages';
import settings from '@/conf/settings';

@ApplyOptions<SwanCommandOptions>({ ...settings.globalCommandsOptions, ...config.settings })
export default class RemoveWarnCommand extends SwanCommand {
  // [{
  //   id: 'warnId',
  //   type: 'string',
  //   prompt: {
  //     start: config.messages.promptStartWarnId,
  //     retry: config.messages.promptRetryWarnId,
  //   },
  // }, {
  //   id: 'reason',
  //   type: 'string',
  //   match: 'rest',
  //   default: messages.global.noReason,
  // }],

  public async run(message: GuildMessage, args: Args): Promise<void> {
    const warnId = await args.pickResult('string');
    if (warnId.error)
      return void await message.channel.send(config.messages.promptRetryWarnId);

    const reason = (await args.restResult('string'))?.value ?? messages.global.noReason;

    const warn = await Sanction.findOne({ sanctionId: warnId.value, revoked: false }).catch(nullop);
    if (!warn) {
      await message.channel.send(config.messages.invalidWarnId).catch(noop);
      return;
    }

    const member = message.guild.member(warn.memberId)
      ?? await message.guild.members.fetch(warn.memberId).catch(nullop);
    if (!member) {
      await message.channel.send(config.messages.memberNotFound);
      return;
    }

    if (this.context.client.currentlyModerating.has(member.id)) {
      await message.channel.send(messages.moderation.alreadyModerated).catch(noop);
      return;
    }

    this.context.client.currentlyModerating.add(member.id);
    setTimeout(() => {
      this.context.client.currentlyModerating.delete(member.id);
    }, 10_000);

    try {
      const convictedUser = await ConvictedUser.findOne({ memberId: member.id });
      if (!convictedUser || convictedUser.currentWarnCount === 0) {
        await message.channel.send(config.messages.notWarned);
        return;
      }

      const data = new ModerationData(message)
        .setVictim(member)
        .setReason(reason)
        .setType(SanctionTypes.RemoveWarn)
        .setOriginalWarnId(warn.sanctionId);

      const success = await new RemoveWarnAction(data).commit();
      if (success)
        await message.channel.send(config.messages.success).catch(noop);
    } catch (unknownError: unknown) {
      this.context.logger.error('An unexpected error occurred while removing a warn from member!');
      this.context.logger.info(`Parsed member: ${member}`);
      this.context.logger.info(`Message: ${message.url}`);
      this.context.logger.info((unknownError as Error).stack, true);
      await message.channel.send(messages.global.oops).catch(noop);
    }
  }
}

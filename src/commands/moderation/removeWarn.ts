import { ApplyOptions } from '@sapphire/decorators';
import Arguments from '@/app/decorators/Argument';
import ConvictedUser from '@/app/models/convictedUser';
import Sanction from '@/app/models/sanction';
import ModerationData from '@/app/moderation/ModerationData';
import RemoveWarnAction from '@/app/moderation/actions/RemoveWarnAction';
import SwanCommand from '@/app/structures/commands/SwanCommand';
import { GuildMessage, SanctionTypes } from '@/app/types';
import type { SwanCommandOptions } from '@/app/types';
import { RemoveWarnCommandArgument } from '@/app/types/CommandArguments';
import { noop, nullop } from '@/app/utils';
import { removeWarn as config } from '@/conf/commands/moderation';
import messages from '@/conf/messages';
import settings from '@/conf/settings';

@ApplyOptions<SwanCommandOptions>({ ...settings.globalCommandsOptions, ...config.settings })
export default class RemoveWarnCommand extends SwanCommand {
  @Arguments({
    name: 'warnId',
    type: 'string',
    match: 'pick',
    required: true,
    message: messages.prompt.warnId,
  }, {
    name: 'reason',
    type: 'string',
    match: 'rest',
    default: messages.prompt.reason,
  })
  // @ts-expect-error ts(2416)
  public override async messageRun(message: GuildMessage, args: RemoveWarnCommandArgument): Promise<void> {
    const warn = await Sanction.findOne({ sanctionId: args.warnId, revoked: false }).catch(nullop);
    if (!warn) {
      await message.channel.send(config.messages.invalidWarnId).catch(noop);
      return;
    }

    const member = message.guild.members.cache.get(warn.memberId)
      ?? await message.guild.members.fetch(warn.memberId).catch(nullop);
    if (!member) {
      await message.channel.send(config.messages.memberNotFound);
      return;
    }

    if (this.container.client.currentlyModerating.has(member.id)) {
      await message.channel.send(messages.moderation.alreadyModerated).catch(noop);
      return;
    }

    this.container.client.currentlyModerating.add(member.id);
    setTimeout(() => {
      this.container.client.currentlyModerating.delete(member.id);
    }, 10_000);

    try {
      const convictedUser = await ConvictedUser.findOne({ memberId: member.id });
      if (!convictedUser || convictedUser.currentWarnCount === 0) {
        await message.channel.send(config.messages.notWarned);
        return;
      }

      const data = new ModerationData(message)
        .setVictim(member)
        .setReason(args.reason)
        .setType(SanctionTypes.RemoveWarn)
        .setOriginalWarnId(warn.sanctionId);

      const success = await new RemoveWarnAction(data).commit();
      if (success)
        await message.channel.send(config.messages.success).catch(noop);
    } catch (unknownError: unknown) {
      this.container.logger.error('An unexpected error occurred while removing a warn from member!');
      this.container.logger.info(`Parsed member: ${member}`);
      this.container.logger.info(`Message: ${message.url}`);
      this.container.logger.info((unknownError as Error).stack, true);
      await message.channel.send(messages.global.oops).catch(noop);
    }
  }
}

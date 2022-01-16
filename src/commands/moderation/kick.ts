import { ApplyOptions } from '@sapphire/decorators';
import type { Args } from '@sapphire/framework';
import type { GuildMember } from 'discord.js';
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
  public override async messageRun(message: GuildMessage, args: Args): Promise<void> {
    const member = await args.pickResult('sanctionnableMember');
    if (!member.success) {
      await message.channel.send(messages.prompt.member);
      return;
    }

    const reason = await args.restResult('string');
    if (!reason.success) {
      await message.channel.send(messages.prompt.reason);
      return;
    }

    await this._exec(message, member.value, reason.value);
  }

  private async _exec(message: GuildMessage, member: GuildMember, reason: string): Promise<void> {
    if (this.container.client.currentlyModerating.has(member.id)) {
      await message.channel.send(messages.moderation.alreadyModerated).catch(noop);
      return;
    }

    this.container.client.currentlyModerating.add(member.id);
    setTimeout(() => {
      this.container.client.currentlyModerating.delete(member.id);
    }, 10_000);

    try {
      const data = new ModerationData(message)
        .setVictim(member)
        .setReason(reason)
        .setType(SanctionTypes.Kick);

      const success = await new KickAction(data).commit();
      if (success)
        await message.channel.send(config.messages.success).catch(noop);
    } catch (unknownError: unknown) {
      this.container.logger.error('An unexpected error occurred while kicking a member!');
      this.container.logger.info(`Parsed member: ${member}`);
      this.container.logger.info(`Message: ${message.url}`);
      this.container.logger.info((unknownError as Error).stack, true);
      await message.channel.send(messages.global.oops).catch(noop);
    }
  }
}

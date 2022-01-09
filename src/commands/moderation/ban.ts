import { ApplyOptions } from '@sapphire/decorators';
import type { Args } from '@sapphire/framework';
import type { GuildMember } from 'discord.js';
import ModerationData from '@/app/moderation/ModerationData';
import BanAction from '@/app/moderation/actions/BanAction';
import SwanCommand from '@/app/structures/commands/SwanCommand';
import { SanctionTypes } from '@/app/types';
import type { GuildMessage, SwanCommandOptions } from '@/app/types';
import { noop } from '@/app/utils';
import { ban as config } from '@/conf/commands/moderation';
import messages from '@/conf/messages';
import settings from '@/conf/settings';

const autobanFlags = ['autoban', 'auto-ban', 'a'];
const purgeFlags = ['purge', 'p'];

@ApplyOptions<SwanCommandOptions>({
  ...settings.globalCommandsOptions,
  ...config.settings,
  flags: [autobanFlags, purgeFlags].flat(),
})
export default class BanCommand extends SwanCommand {
  public override async messageRun(message: GuildMessage, args: Args): Promise<void> {
    const autoban = args.getFlags(...autobanFlags);

    const purge = args.getFlags(...purgeFlags);

    const member = await args.pickResult('sanctionnableMember');
    if (!member.success) {
      await message.channel.send(messages.prompt.member);
      return;
    }

    const duration = await args.pickResult('duration', { permanent: true }).then(result => result.value);
    const isValid = message.member.roles.highest.id === settings.roles.forumModerator
      ? (duration > 0 && duration < settings.moderation.maximumDurationForumModerator)
      : true;
    if (!duration || !isValid) {
      await message.channel.send(messages.prompt.duration);
      return;
    }

    const reason = await args.restResult('string');
    if (!reason.success) {
    await message.channel.send(messages.prompt.reason);
      return;
    }

    await this._exec(message, autoban, purge, member.value, duration, reason.value);
  }

  // eslint-disable-next-line max-params
  private async _exec(
    message: GuildMessage,
    autoban: boolean,
    purge: boolean,
    member: GuildMember,
    duration: number,
    reason: string,
  ): Promise<void> {
    if (this.container.client.currentlyModerating.has(member.id)) {
      await message.channel.send(messages.moderation.alreadyModerated).catch(noop);
      return;
    }

    this.container.client.currentlyModerating.add(member.id);
    setTimeout(() => {
      this.container.client.currentlyModerating.delete(member.id);
    }, 10_000);

    const data = new ModerationData(message)
      .setVictim(member)
      .setReason(reason)
      .setShouldPurge(purge);

    if (duration === -1) {
      data.setDuration(duration, false)
        .setType(SanctionTypes.Hardban);
    } else {
      data.setDuration(duration * 1000, true)
        .setInformations({ shouldAutobanIfNoMessages: autoban })
        .setType(SanctionTypes.Ban);
    }

    try {
      const success = await new BanAction(data).commit();
      if (success)
        await message.channel.send(config.messages.success).catch(noop);
    } catch (unknownError: unknown) {
      this.container.logger.error('An unexpected error occurred while banning a member!');
      this.container.logger.info(`Duration: ${duration === -1 ? duration : duration * 1000}`);
      this.container.logger.info(`Parsed member: ${member}`);
      this.container.logger.info(`Autoban: ${autoban}`);
      this.container.logger.info(`Message: ${message.url}`);
      this.container.logger.info((unknownError as Error).stack, true);
      await message.channel.send(messages.global.oops).catch(noop);
    }
  }
}

import { ApplyOptions } from '@sapphire/decorators';
import { AuditLogEvent } from 'discord.js';
import { ModerationData } from '#moderation/ModerationData';
import * as ModerationHelper from '#moderation/ModerationHelper';
import { BanAction } from '#moderation/actions/BanAction';
import type { TaskOptions } from '#structures/tasks/Task';
import { Task } from '#structures/tasks/Task';
import { SanctionTypes } from '#types/index';
import { nullop } from '#utils/index';

@ApplyOptions<TaskOptions>({ startupOrder: 9 })
export class FetchMissingBansTask extends Task {
  public override async run(): Promise<void> {
    const bans = await this.container.client.guild.bans.fetch();
    const logs = await this.container.client.guild.fetchAuditLogs({ type: AuditLogEvent.MemberBanAdd });

    for (const ban of bans.values()) {
      const currentHardban = await ModerationHelper.getCurrentHardban(ban.user.id);
      if (!currentHardban) {
        const discordBan = logs.entries.find(entry => entry.target.id === ban.user.id);
        if (!discordBan)
          continue;

        const moderator = this.container.client.guild.members.resolve(discordBan.executor)
          ?? await this.container.client.guild.members.fetch(discordBan.executor)
            .catch(nullop);
        if (!moderator)
          continue;

        const data = new ModerationData()
          .setVictim(ban.user, false)
          .setReason(ban.reason)
          .setModeratorId(moderator.id)
          .setDuration(-1, false)
          .setType(SanctionTypes.Hardban);
        try {
          await new BanAction(data).commit();
        } catch (unknownError: unknown) {
          this.container.logger.error('An unexpected error occurred while banning a member!');
          this.container.logger.info(`Member ID: ${ban.user.id}`);
          this.container.logger.info(`Discord Ban Found: ${Boolean(discordBan)}`);
          this.container.logger.info((unknownError as Error).stack, true);
        }
      }
    }
  }
}

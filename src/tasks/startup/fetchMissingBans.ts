import { ApplyOptions } from '@sapphire/decorators';
import { GuildAuditLogs } from 'discord.js';
import ConvictedUser from '@/app/models/convictedUser';
import ModerationData from '@/app/moderation/ModerationData';
import BanAction from '@/app/moderation/actions/BanAction';
import type { TaskOptions } from '@/app/structures/tasks/Task';
import Task from '@/app/structures/tasks/Task';
import { SanctionTypes } from '@/app/types';
import { nullop } from '@/app/utils';

@ApplyOptions<TaskOptions>({ startupOrder: 9 })
export default class CacheReactionRolesTask extends Task {
  public override async run(): Promise<void> {
    const bans = await this.container.client.guild.bans.fetch();
    const convictedUsers = await ConvictedUser.find();
    for (const ban of bans.values()) {
      if (!convictedUsers.some(usr => usr.memberId === ban.user.id)) {
        const logs = await this.container.client.guild.fetchAuditLogs({
          type: GuildAuditLogs.Actions.MEMBER_BAN_ADD,
        });

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

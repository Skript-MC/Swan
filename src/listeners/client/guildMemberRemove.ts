import { Listener } from '@sapphire/framework';
import type { GuildMember } from 'discord.js';
import { AuditLogEvent } from 'discord.js';
import { ModerationData } from '@/app/moderation/ModerationData';
import * as ModerationHelper from '@/app/moderation/ModerationHelper';
import { BanAction } from '@/app/moderation/actions/BanAction';
import { KickAction } from '@/app/moderation/actions/KickAction';
import { SanctionTypes } from '@/app/types';
import * as messages from '@/conf/messages';

export class GuildMemberRemoveListener extends Listener {
  public override async run(member: GuildMember): Promise<void> {
    const currentBan = await ModerationHelper.getCurrentBan(member.id);
    if (currentBan && this.container.client.currentlyBanning.has(member.id))
      return;

    const kicks = await member.guild.fetchAuditLogs({
      type: AuditLogEvent.MemberKick,
    });

    const lastKick = kicks.entries.first();

    // Check if they've been kicked
    if (lastKick
      && lastKick.target.id === member.id
      && !lastKick.executor.bot
      && lastKick.createdTimestamp >= Date.now() - 1000) {
      const data = new ModerationData()
        .setVictim(member, false)
        .setReason(lastKick.reason)
        .setType(SanctionTypes.Kick);
      await new KickAction(data).commit();
    }

    // Check if they're leaving while being banned
    if (currentBan) {
      const data = new ModerationData()
        .setVictim(member, false)
        .setDuration(-1, false)
        .setReason(messages.moderation.reasons.leaveBan)
        .setType(SanctionTypes.Hardban);
      await new BanAction(data).commit();
    }
  }
}

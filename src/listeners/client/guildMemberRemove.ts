import { Listener } from '@sapphire/framework';
import type { GuildMember } from 'discord.js';
import { GuildAuditLogs } from 'discord.js';
import ModerationData from '@/app/moderation/ModerationData';
import ModerationHelper from '@/app/moderation/ModerationHelper';
import BanAction from '@/app/moderation/actions/BanAction';
import KickAction from '@/app/moderation/actions/KickAction';
import { SanctionTypes } from '@/app/types';
import messages from '@/conf/messages';

export default class GuildMemberRemoveListener extends Listener {
  public override async run(member: GuildMember): Promise<void> {
    const isBanned = await ModerationHelper.isBanned(member.id, false);
    if (isBanned && this.container.client.currentlyBanning.has(member.id))
      return;

    const kicks = await member.guild.fetchAuditLogs({
      type: GuildAuditLogs.Actions.MEMBER_KICK,
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
    if (isBanned) {
      const data = new ModerationData()
        .setVictim(member, false)
        .setDuration(-1, false)
        .setReason(messages.moderation.reasons.leaveBan)
        .setType(SanctionTypes.Hardban);
      await new BanAction(data).commit();
    }
  }
}

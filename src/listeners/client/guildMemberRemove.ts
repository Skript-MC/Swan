import { Listener } from 'discord-akairo';
import { GuildAuditLogs } from 'discord.js';
import type { GuildMember } from 'discord.js';
import ModerationData from '@/app/moderation/ModerationData';
import ModerationHelper from '@/app/moderation/ModerationHelper';
import BanAction from '@/app/moderation/actions/BanAction';
import KickAction from '@/app/moderation/actions/KickAction';
import type { GuildKickAuditLogs } from '@/app/types';
import { SanctionTypes } from '@/app/types';
import messages from '@/conf/messages';

class GuildMemberRemoveListener extends Listener {
  constructor() {
    super('guildMemberRemove', {
      event: 'guildMemberRemove',
      emitter: 'client',
    });
  }

  public async exec(member: GuildMember): Promise<void> {
    const isBanned = await ModerationHelper.isBanned(member.id, false);
    if (isBanned && this.client.currentlyBanning.has(member.id))
      return;

    const kicks = await member.guild.fetchAuditLogs({
      type: GuildAuditLogs.Actions.MEMBER_KICK,
    }) as GuildKickAuditLogs;

    const lastKick = kicks.entries.first();

    // Check if they've been kicked
    if (lastKick
      && lastKick.target.id === member.id
      && !lastKick.executor.bot
      && lastKick.createdTimestamp >= Date.now() - 1000) {
      const data = new ModerationData(this.client)
        .setVictim(member)
        .setReason(lastKick.reason)
        .setType(SanctionTypes.Kick);
      await new KickAction(data).commit();
    }

    // Check if they're leaving while being banned
    if (isBanned) {
      const data = new ModerationData(this.client)
        .setVictim(member)
        .setDuration(-1, false)
        .setReason(messages.moderation.reasons.leaveBan)
        .setType(SanctionTypes.Hardban);
      await new BanAction(data).commit();
    }
  }
}

export default GuildMemberRemoveListener;

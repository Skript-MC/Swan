import { Listener } from 'discord-akairo';
import { GuildAuditLogs } from 'discord.js';
import type { GuildMember } from 'discord.js';
import messages from '../../../config/messages';
import ModerationData from '../../moderation/ModerationData';
import ModerationHelper from '../../moderation/ModerationHelper';
import BanAction from '../../moderation/actions/BanAction';
import KickAction from '../../moderation/actions/KickAction';
import type { GuildKickAuditLogs } from '../../types';
import { SanctionTypes } from '../../types';

class GuildMemberRemoveListener extends Listener {
  constructor() {
    super('guildMemberRemove', {
      event: 'guildMemberRemove',
      emitter: 'client',
    });
  }

  public async exec(member: GuildMember): Promise<void> {
    const isBanned = await ModerationHelper.isBanned(member.id, false);
    if (isBanned && this.client.currentlyBanning.includes(member.id))
      return;

    const kicks: GuildKickAuditLogs = await member.guild.fetchAuditLogs({
      type: GuildAuditLogs.Actions.MEMBER_KICK,
    }) as GuildKickAuditLogs;

    const lastKick = kicks.entries.first();
    const isKicked = lastKick
      && lastKick.target.id === member.id
      && !lastKick.executor.bot
      && lastKick.createdTimestamp >= Date.now() - 1000;

    // Check if they've been kicked
    if (isKicked) {
      const data = new ModerationData(this.client)
        .setVictim(member)
        .setReason(lastKick.reason)
        .setType(SanctionTypes.Kick);
      await new KickAction(data).commit();
    }

    if (isBanned) {
      // Check if they're leaving while being banned
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

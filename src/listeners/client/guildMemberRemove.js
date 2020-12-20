import { Listener } from 'discord-akairo';
import { GuildAuditLogs } from 'discord.js';
import messages from '../../../config/messages';
import settings from '../../../config/settings';
import ModerationData from '../../moderation/ModerationData';
import ModerationHelper from '../../moderation/ModerationHelper';
import BanAction from '../../moderation/actions/BanAction';
import KickAction from '../../moderation/actions/KickAction';
import { constants } from '../../utils';

class GuildMemberRemoveListener extends Listener {
  constructor() {
    super('guildMemberRemove', {
      event: 'guildMemberRemove',
      emitter: 'client',
    });
  }

  async exec(member) {
    const isBanned = await ModerationHelper.isBanned(member.id, false);
    if (isBanned && this.client.currentlyBanning.includes(member.id))
      return;

    const kicks = await member.guild.fetchAuditLogs({ type: GuildAuditLogs.Actions.MEMBER_KICK });
    const lastKick = kicks.entries.first();
    const isKicked = lastKick
      && lastKick.target.id === member.id
      && !lastKick.executor.bot
      && lastKick.createdTimestamp >= Date.now() - 1000;

    const channel = member.guild.channels.resolve(settings.channels.log);

    // Check if they've been kicked
    if (isKicked) {
      const data = new ModerationData(member.guild.me, member.guild, this.client, channel)
        .setVictim(member)
        .setReason(lastKick.reason)
        .setType(constants.SANCTIONS.TYPES.KICK);
      await new KickAction(data).commit();
    }

    if (isBanned) {
      // Check if they're leaving while being banned
      const data = new ModerationData(member.guild.me, member.guild, this.client, channel)
        .setVictim(member)
        .setDuration(-1, false)
        .setReason(messages.moderation.reasons.leaveBan)
        .setType(constants.SANCTIONS.TYPES.HARDBAN);
      await new BanAction(data).commit();
    }
  }
}

export default GuildMemberRemoveListener;

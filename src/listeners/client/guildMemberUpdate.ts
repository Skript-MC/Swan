import SwanListener from '@/app/structures/SwanListener';
import { GuildAuditLogs, GuildMember } from 'discord.js';
import ModerationData from '@/app/moderation/ModerationData';
import messages from '@/conf/messages';
import { SanctionTypes } from '@/app/types';
import BanAction from '@/app/moderation/actions/BanAction';
import KickAction from '@/app/moderation/actions/KickAction';
import MuteAction from '@/app/moderation/actions/MuteAction';

export default class GuildMemberUpdate extends SwanListener {
  public override async run(oldMember: GuildMember, newMember: GuildMember): Promise<void> {
    if (oldMember.user.bot)
      return;

    console.log(oldMember.communicationDisabledUntilTimestamp);
    console.log(newMember.communicationDisabledUntilTimestamp);
    if (newMember.communicationDisabledUntilTimestamp && newMember.communicationDisabledUntilTimestamp >= Date.now()) {
      const updates = await newMember.guild.fetchAuditLogs({
        type: GuildAuditLogs.Actions.MEMBER_UPDATE,
      });

      // We are now extra-sure about that is the right update
      const update = updates.entries.filter(u => u.changes?.every(c => c.key === 'communication_disabled_until'
          && Date.parse(c.new as string) === newMember.communicationDisabledUntilTimestamp)).first();

      // Check if they've been kicked
      if (update
        && update.target.id === newMember.id
        && !update.executor.bot
        && update.createdTimestamp >= Date.now() - 1000) {
        const data = new ModerationData()
          .setVictim(newMember, false)
          .setModeratorId(update.executor.id)
          .setDuration(newMember.communicationDisabledUntilTimestamp - Date.now(), true)
          .setReason(update.reason)
          .setType(SanctionTypes.Mute);
        await new MuteAction(data).commit();
      }
    }
  }
}

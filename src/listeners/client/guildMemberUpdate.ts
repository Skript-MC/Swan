import { Listener } from '@sapphire/framework';
import type { GuildMember } from 'discord.js';
import { AuditLogEvent } from 'discord.js';
import { ModerationData } from '#moderation/ModerationData';
import * as ModerationHelper from '#moderation/ModerationHelper';
import { MuteAction } from '#moderation/actions/MuteAction';
import { UnmuteAction } from '#moderation/actions/UnmuteAction';
import { SanctionTypes } from '#types/index';

export class GuildMemberUpdateListener extends Listener {
  public override async run(oldMember: GuildMember, newMember: GuildMember): Promise<void> {
    if (oldMember.user.bot) return;

    const isNewMute =
      newMember.communicationDisabledUntilTimestamp && newMember.communicationDisabledUntilTimestamp >= Date.now();
    const isRevokedMute =
      oldMember.communicationDisabledUntilTimestamp && !newMember.communicationDisabledUntilTimestamp;

    if (!isNewMute && !isRevokedMute) return;

    const updates = await newMember.guild.fetchAuditLogs({
      type: AuditLogEvent.MemberUpdate,
    });

    // We are now extra-sure about that is the right update
    const update = updates.entries
      .filter((u) =>
        u.changes?.every(
          (c) =>
            c.key === 'communication_disabled_until' &&
            (Date.parse(c.new as string) === newMember.communicationDisabledUntilTimestamp ||
              Date.parse(c.old as string) === oldMember.communicationDisabledUntilTimestamp),
        ),
      )
      .first();

    if (
      !update?.target ||
      !update.executor ||
      update.target.id !== newMember.id ||
      update.executor.bot ||
      update.createdTimestamp <= Date.now() - 1000
    )
      return;

    const data = new ModerationData()
      .setVictim({ id: newMember.id, name: newMember.displayName })
      .setDuration((newMember.communicationDisabledUntilTimestamp || 0) - Date.now(), true)
      .setType(SanctionTypes.Mute)
      .setReason(update.reason)
      .setModeratorId(update.executor.id);

    if (isNewMute) {
      data.setType(SanctionTypes.Mute);
      await new MuteAction(data).commit();
    } else if (isRevokedMute) {
      const currentMute = await ModerationHelper.getCurrentMute(newMember.id);
      if (!currentMute) return;

      data.setSanctionId(currentMute.sanctionId).setType(SanctionTypes.Unmute);
      await new UnmuteAction(data).commit();
    }
  }
}

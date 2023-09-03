import { ApplyOptions } from '@sapphire/decorators';
import { Sanction } from '@/app/models/sanction';
import { ModerationData } from '@/app/moderation/ModerationData';
import { RemoveWarnAction } from '@/app/moderation/actions/RemoveWarnAction';
import { UnbanAction } from '@/app/moderation/actions/UnbanAction';
import { UnmuteAction } from '@/app/moderation/actions/UnmuteAction';
import type { TaskOptions } from '@/app/structures/tasks/Task';
import { Task } from '@/app/structures/tasks/Task';
import { SanctionTypes } from '@/app/types';
import { noop } from '@/app/utils';
import * as messages from '@/conf/messages';

@ApplyOptions<TaskOptions>({ interval: 10_000 })
export class ModerationTask extends Task {
  public override async run(): Promise<void> {
    // Fetch all the sanctions that are not revoked but are expired.
    const sanctions = await Sanction.find({
      revoked: false,
      finish: {
        $lte: Date.now(),
        $ne: -1,
      },
    });

    for (const sanction of sanctions) {
      const {
        userId,
        type,
        sanctionId,
      } = sanction;

      const member = this.container.client.guild.members.cache.get(userId)
        ?? (await this.container.client.guild.members.fetch(userId)
          .catch(noop));
      if (!member)
        continue;

      const user = member.user
        ?? this.container.client.users.resolve(userId)
        ?? (await this.container.client.users.fetch(userId)
          .catch(noop));
      if (!user)
        continue;

      const data = new ModerationData()
        .setSanctionId(sanctionId)
        .setVictim(member ?? user, false)
        .setReason(messages.moderation.reasons.autoRevoke);

      switch (type) {
        case SanctionTypes.TempBan:
          data.setType(SanctionTypes.Unban);
          await new UnbanAction(data).commit();
          break;

        case SanctionTypes.Mute:
          data.setType(SanctionTypes.Unmute);
          await new UnmuteAction(data).commit();
          break;

        case SanctionTypes.Warn:
          data.setType(SanctionTypes.RemoveWarn);
          await new RemoveWarnAction(data).commit();
          break;

        default:
          break;
      }
    }
  }
}

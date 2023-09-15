import { ApplyOptions } from '@sapphire/decorators';
import * as messages from '#config/messages';
import { Sanction } from '#models/sanction';
import { ModerationData } from '#moderation/ModerationData';
import { RemoveWarnAction } from '#moderation/actions/RemoveWarnAction';
import { UnbanAction } from '#moderation/actions/UnbanAction';
import { UnmuteAction } from '#moderation/actions/UnmuteAction';
import type { TaskOptions } from '#structures/tasks/Task';
import { Task } from '#structures/tasks/Task';
import { SanctionTypes } from '#types/index';

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
      const { userId, type, sanctionId } = sanction;

      const person = await this.container.client.guild.members.fetch(userId).catch(null)
        ?? await this.container.client.users.fetch(userId).catch(null);
      if (!person)
        continue;

      const data = new ModerationData()
        .setSanctionId(sanctionId)
        .setVictim({ id: person.id, name: person.displayName })
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

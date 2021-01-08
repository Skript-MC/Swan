import messages from '../../config/messages';
import Sanction from '../models/sanction';
import ModerationData from '../moderation/ModerationData';
import BanAction from '../moderation/actions/BanAction';
import RemoveWarnAction from '../moderation/actions/RemoveWarnAction';
import UnbanAction from '../moderation/actions/UnbanAction';
import UnmuteAction from '../moderation/actions/UnmuteAction';
import Task from '../structures/Task';
import { SanctionTypes } from '../types';
import { noop } from '../utils';

class ModerationTask extends Task {
  constructor() {
    super('moderation', {
      // Every 10 seconds
      interval: 10_000,
    });
  }

  public async exec(): Promise<void> {
    const sanctions = await Sanction.find({
      revoked: false,
      finish: { $lte: Date.now(), $ne: -1 },
    });

    for (const sanction of sanctions) {
      const { memberId } = sanction;

      const member = this.client.guild.members.cache.get(memberId)
        ?? (await this.client.guild.members.fetch(memberId).catch(noop) || null);

      const user = member?.user
        ?? this.client.users.resolve(memberId)
        ?? (await this.client.users.fetch(memberId).catch(noop) || null);

      if (!member && !user)
        continue;

      const data = new ModerationData(this.client)
        .setVictim(member ?? user, false)
        .setReason(messages.moderation.reasons.autoRevoke);

      switch (sanction.type) {
        case SanctionTypes.Ban: {
          if (sanction.informations?.hasSentMessage) {
            data.setType(SanctionTypes.Unban);
            await new UnbanAction(data).commit();
          } else {
            data.setReason(messages.moderation.reasons.autoBanInactivity)
              .setType(SanctionTypes.Hardban);
            await new BanAction(data).commit();
          }
          break;
        }

        case SanctionTypes.Mute: {
          data.setType(SanctionTypes.Unmute);
          await new UnmuteAction(data).commit();
          break;
        }

        case SanctionTypes.Warn: {
          data.setType(SanctionTypes.RemoveWarn);
          await new RemoveWarnAction(data).commit();
          break;
        }

        default:
          break;
      }
    }
  }
}

export default ModerationTask;

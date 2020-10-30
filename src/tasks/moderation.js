import settings from '../../config/settings';
import Sanction from '../models/sanction';
import ModerationData from '../structures/ModerationData';
import Task from '../structures/Task';
import BanAction from '../structures/actions/BanAction';
import UnbanAction from '../structures/actions/UnbanAction';
import { constants } from '../utils';
import messages from '../../config/messages';

class ModerationTask extends Task {
  constructor() {
    super('moderation', {
      // Every 10 seconds
      interval: 10_000,
    });
  }

  async exec() {
    const sanctions = await Sanction.find({
      revoked: false,
      finish: { $lte: Date.now(), $ne: -1 },
    });

    const channel = this.client.guild.channels.resolve(settings.channels.log);

    for (const sanction of sanctions) {
      /* eslint-disable no-await-in-loop */
      const { memberId } = sanction;

      const member = this.client.guild.member(memberId);
      const user = member?.user || this.client.users.resolve(memberId);
      if (!member && !user)
        continue;

      if (sanction.type === constants.SANCTIONS.TYPES.BAN) {
        const data = new ModerationData(this.client.guild.me, this.client.guild, this.client, channel)
          .setVictim(member || user);
        if (sanction.informations?.hasSentMessage) {
          data.setReason(messages.moderation.reasons.autoUnban)
            .setType(constants.SANCTIONS.TYPES.UNBAN);
          await new UnbanAction(data).commit();
        } else {
          data.setReason(messages.moderation.reasons.autoBan)
            .setType(constants.SANCTIONS.TYPES.HARDBAN);
          await new BanAction(data).commit();
        }
      }
    }
  }
}

export default ModerationTask;

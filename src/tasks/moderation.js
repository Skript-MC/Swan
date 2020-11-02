import messages from '../../config/messages';
import settings from '../../config/settings';
import Sanction from '../models/sanction';
import ModerationData from '../structures/ModerationData';
import Task from '../structures/Task';
import BanAction from '../structures/actions/BanAction';
import UnbanAction from '../structures/actions/UnbanAction';
import UnmuteAction from '../structures/actions/UnmuteAction';
import { constants, noop } from '../utils';

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

      const member = this.client.guild.member(memberId)
        || await this.client.guild.members.fetch(memberId).catch(noop);

      const user = member?.user
        || this.client.users.resolve(memberId)
        || await this.client.users.fetch(memberId).catch(noop);

      if (!member && !user)
        continue;

      if (sanction.type === constants.SANCTIONS.TYPES.BAN) {
        const data = new ModerationData(this.client.guild.me, this.client.guild, this.client, channel)
          .setVictim(member || user);

        if (sanction.informations?.hasSentMessage) {
          data.setReason(messages.moderation.reasons.autoRevoke)
            .setType(constants.SANCTIONS.TYPES.UNBAN);
          await new UnbanAction(data).commit();
        } else {
          data.setReason(messages.moderation.reasons.autoBan)
            .setType(constants.SANCTIONS.TYPES.HARDBAN);
          await new BanAction(data).commit();
        }
      } else if (sanction.type === constants.SANCTIONS.TYPES.MUTE) {
        const data = new ModerationData(this.client.guild.me, this.client.guild, this.client, channel)
          .setVictim(member || user, false)
          .setReason(messages.moderation.reasons.autoRevoke)
          .setType(constants.SANCTIONS.TYPES.UNMUTE);

        await new UnmuteAction(data).commit();
      }
    }
  }
}

export default ModerationTask;

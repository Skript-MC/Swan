import { Listener } from 'discord-akairo';
import messages from '../../../config/messages';
import settings from '../../../config/settings';
import ModerationData from '../../structures/ModerationData';
import ModerationHelper from '../../structures/ModerationHelper';
import BanAction from '../../structures/actions/BanAction';
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

    if (isBanned) {
      const channel = member.guild.channels.resolve(settings.channels.log);
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

import { Listener } from 'discord-akairo';
import messages from '../../../config/messages';
import settings from '../../../config/settings';
import ModerationData from '../../structures/ModerationData';
import ModerationHelper from '../../structures/ModerationHelper';
import UnbanAction from '../../structures/actions/UnbanAction';
import { constants } from '../../utils';

class GuildBanRemoveListener extends Listener {
  constructor() {
    super('guildBanRemove', {
      event: 'guildBanRemove',
      emitter: 'client',
    });
  }

  async exec(guild, user) {
    if (this.client.currentlyUnbanning.includes(user.id))
      return;

    const isBanned = await ModerationHelper.isBanned(user.id, true);
    if (!isBanned)
      return;

    const channel = guild.channels.resolve(settings.channels.log);

    const data = new ModerationData(guild.me, guild, this.client, channel)
      .setVictim(user, false)
      .setReason(messages.miscellaneous.noReason)
      .setType(constants.SANCTIONS.TYPES.UNBAN);

    await new UnbanAction(data).commit();
  }
}

export default GuildBanRemoveListener;

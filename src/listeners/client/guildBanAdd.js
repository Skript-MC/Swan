import { Listener } from 'discord-akairo';
import settings from '../../../config/settings';
import ModerationData from '../../structures/ModerationData';
import BanAction from '../../structures/actions/BanAction';
import { constants } from '../../utils';

class GuildBanAddListener extends Listener {
  constructor() {
    super('guildBanAdd', {
      event: 'guildBanAdd',
      emitter: 'client',
    });
  }

  async exec(guild, user) {
    if (this.client.currentlyBanning.includes(user.id))
      return;

    const member = guild.members.resolve(user.id) || await guild.members.fetch(user.id);
    if (!member)
      return;

    const { reason } = await guild.fetchBan(user.id);
    const channel = guild.channels.resolve(settings.channels.log);

    const data = new ModerationData(guild.me, guild, this.client, channel)
      .setVictim(member)
      .setDuration(-1, false)
      .setReason(reason)
      .setType(constants.SANCTIONS.TYPES.HARDBAN);

    await new BanAction(data).commit();
  }
}

export default GuildBanAddListener;

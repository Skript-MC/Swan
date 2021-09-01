import { Listener } from 'discord-akairo';
import type { Guild, User } from 'discord.js';
import ModerationData from '@/app/moderation/ModerationData';
import BanAction from '@/app/moderation/actions/BanAction';
import { SanctionTypes } from '@/app/types';

class GuildBanAddListener extends Listener {
  constructor() {
    super('guildBanAdd', {
      event: 'guildBanAdd',
      emitter: 'client',
    });
  }

  public async exec(guild: Guild, user: User): Promise<void> {
    if (this.client.currentlyBanning.has(user.id))
      return;

    const victim = this.client.users.resolve(user.id) ?? await this.client.users.fetch(user.id);
    if (!victim)
      return;

    const { reason } = await guild.fetchBan(user.id);

    const data = new ModerationData(this.client)
      .setVictim(victim, false)
      .setDuration(-1, false)
      .setReason(reason)
      .setType(SanctionTypes.Hardban);

    await new BanAction(data).commit();
  }
}

export default GuildBanAddListener;

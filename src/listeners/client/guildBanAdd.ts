import { Listener } from '@sapphire/framework';
import type { Guild, User } from 'discord.js';
import ModerationData from '@/app/moderation/ModerationData';
import BanAction from '@/app/moderation/actions/BanAction';
import { SanctionTypes } from '@/app/types';

export default class GuildBanAddListener extends Listener {
  public override async run(guild: Guild, user: User): Promise<void> {
    if (this.container.client.currentlyBanning.has(user.id))
      return;

    const victim = this.container.client.users.resolve(user.id) ?? await this.container.client.users.fetch(user.id);
    if (!victim)
      return;

    const { reason } = await guild.bans.fetch(user.id);

    const data = new ModerationData()
      .setVictim(victim, false)
      .setDuration(-1, false)
      .setReason(reason)
      .setType(SanctionTypes.Hardban);

    await new BanAction(data).commit();
  }
}

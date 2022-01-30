import { Listener } from '@sapphire/framework';
import type { GuildBan } from 'discord.js';
import ModerationData from '@/app/moderation/ModerationData';
import BanAction from '@/app/moderation/actions/BanAction';
import { SanctionTypes } from '@/app/types';

export default class GuildBanAddListener extends Listener {
  public override async run(ban: GuildBan): Promise<void> {
    if (this.container.client.currentlyBanning.has(ban.user.id))
      return;

    const victim = this.container.client.users.resolve(ban.user.id)
      ?? await this.container.client.users.fetch(ban.user.id);
    if (!victim)
      return;

    const { reason } = await ban.guild.bans.fetch(ban.user.id);

    const data = new ModerationData()
      .setVictim(victim, false)
      .setDuration(-1, false)
      .setReason(reason)
      .setType(SanctionTypes.Hardban);

    await new BanAction(data).commit();
  }
}

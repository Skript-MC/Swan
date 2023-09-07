import { Listener } from '@sapphire/framework';
import type { GuildBan } from 'discord.js';
import { ModerationData } from '#moderation/ModerationData';
import { BanAction } from '#moderation/actions/BanAction';
import { SanctionTypes } from '#types/index';

export class GuildBanAddListener extends Listener {
  public override async run(ban: GuildBan): Promise<void> {
    if (this.container.client.currentlyBanning.has(ban.user.id))
      return;

    const victim = await this.container.client.users.fetch(ban.user.id);
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

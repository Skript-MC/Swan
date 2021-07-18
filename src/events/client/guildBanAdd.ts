import { Event } from '@sapphire/framework';
import type { Guild, User } from 'discord.js';
import ModerationData from '@/app/moderation/ModerationData';
import BanAction from '@/app/moderation/actions/BanAction';
import { SanctionTypes } from '@/app/types';

export default class GuildBanAddEvent extends Event {
  public override async run(guild: Guild, user: User): Promise<void> {
    if (this.context.client.currentlyBanning.has(user.id))
      return;

    const member = guild.members.resolve(user.id) ?? await guild.members.fetch(user.id);
    if (!member)
      return;

    const { reason } = await guild.fetchBan(user.id);

    const data = new ModerationData()
      .setVictim(member)
      .setDuration(-1, false)
      .setReason(reason)
      .setType(SanctionTypes.Hardban);

    await new BanAction(data).commit();
  }
}

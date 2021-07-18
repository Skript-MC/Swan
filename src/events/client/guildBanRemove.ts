import { Event } from '@sapphire/framework';
import type { Guild, User } from 'discord.js';
import ModerationData from '@/app/moderation/ModerationData';
import ModerationHelper from '@/app/moderation/ModerationHelper';
import UnbanAction from '@/app/moderation/actions/UnbanAction';
import { SanctionTypes } from '@/app/types';
import messages from '@/conf/messages';

export default class GuildBanRemoveEvent extends Event {
  public override async run(_guild: Guild, user: User): Promise<void> {
    if (this.context.client.currentlyUnbanning.has(user.id))
      return;

    const isBanned = await ModerationHelper.isBanned(user.id, true);
    if (!isBanned)
      return;

    const data = new ModerationData()
      .setVictim(user, false)
      .setReason(messages.global.noReason)
      .setType(SanctionTypes.Unban);

    await new UnbanAction(data).commit();
  }
}

import type { GuildBan } from 'discord.js';
import ModerationData from '@/app/moderation/ModerationData';
import ModerationHelper from '@/app/moderation/ModerationHelper';
import UnbanAction from '@/app/moderation/actions/UnbanAction';
import SwanListener from '@/app/structures/SwanListener';
import { SanctionTypes } from '@/app/types';
import messages from '@/conf/messages';

export default class GuildBanRemoveListener extends SwanListener {
  public override async run(ban: GuildBan): Promise<void> {
    if (this.container.client.currentlyUnbanning.has(ban.user.id))
      return;

    const isBanned = await ModerationHelper.isBanned(ban.user.id, true);
    if (!isBanned)
      return;

    const data = new ModerationData()
      .setVictim(ban.user, false)
      .setReason(messages.global.noReason)
      .setType(SanctionTypes.Unban);

    await new UnbanAction(data).commit();
  }
}

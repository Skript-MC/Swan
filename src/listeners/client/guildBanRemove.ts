import { Listener } from '@sapphire/framework';
import type { GuildBan } from 'discord.js';
import { ModerationData } from '@/app/moderation/ModerationData';
import * as ModerationHelper from '@/app/moderation/ModerationHelper';
import { UnbanAction } from '@/app/moderation/actions/UnbanAction';
import { SanctionTypes } from '@/app/types';
import * as messages from '@/conf/messages';

export class GuildBanRemoveListener extends Listener {
  public override async run(ban: GuildBan): Promise<void> {
    if (this.container.client.currentlyUnbanning.has(ban.user.id))
      return;

    const currentHardban = await ModerationHelper.getCurrentHardban(ban.user.id);
    if (!currentHardban)
      return;

    const data = new ModerationData()
      .setVictim(ban.user, false)
      .setReason(messages.global.noReason)
      .setType(SanctionTypes.Unban);

    await new UnbanAction(data).commit();
  }
}

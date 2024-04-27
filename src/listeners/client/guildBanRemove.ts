import { Listener } from '@sapphire/framework';
import type { GuildBan } from 'discord.js';
import * as messages from '#config/messages';
import { ModerationData } from '#moderation/ModerationData';
import * as ModerationHelper from '#moderation/ModerationHelper';
import { UnbanAction } from '#moderation/actions/UnbanAction';
import { SanctionTypes } from '#types/index';

export class GuildBanRemoveListener extends Listener {
  public override async run(ban: GuildBan): Promise<void> {
    if (this.container.client.currentlyUnbanning.has(ban.user.id)) return;

    const currentHardban = await ModerationHelper.getCurrentHardban(
      ban.user.id,
    );
    if (!currentHardban) return;

    const data = new ModerationData()
      .setVictim({ id: ban.user.id, name: ban.user.displayName })
      .setReason(messages.global.noReason)
      .setType(SanctionTypes.Unban);

    await new UnbanAction(data).commit();
  }
}

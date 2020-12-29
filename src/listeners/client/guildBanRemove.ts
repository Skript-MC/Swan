import { Listener } from 'discord-akairo';
import type { Guild, User } from 'discord.js';
import messages from '../../../config/messages';
import ModerationData from '../../moderation/ModerationData';
import ModerationHelper from '../../moderation/ModerationHelper';
import UnbanAction from '../../moderation/actions/UnbanAction';
import { SanctionTypes } from '../../types';

class GuildBanRemoveListener extends Listener {
  constructor() {
    super('guildBanRemove', {
      event: 'guildBanRemove',
      emitter: 'client',
    });
  }

  public async exec(guild: Guild, user: User): Promise<void> {
    if (this.client.currentlyUnbanning.includes(user.id))
      return;

    const isBanned = await ModerationHelper.isBanned(user.id, true);
    if (!isBanned)
      return;

    const data = new ModerationData(this.client)
      .setVictim(user, false)
      .setReason(messages.global.noReason)
      .setType(SanctionTypes.Unban);

    await new UnbanAction(data).commit();
  }
}

export default GuildBanRemoveListener;

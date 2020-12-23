import { Inhibitor } from 'discord-akairo';
import type { Message } from 'discord.js';
import ConvictedUser from '../models/convictedUser';
import { noop } from '../utils';

class PreventBannedUsersInhibitor extends Inhibitor {
  constructor() {
    super('preventBannedUsers', {
      reason: 'preventBannedUsers',
    });
  }

  public async exec(message: Message): Promise<boolean> {
    const result = await ConvictedUser.findOne({ memberId: message.author.id }).catch(noop) || null;
    return typeof result?.lastBanId !== 'undefined';
  }
}

export default PreventBannedUsersInhibitor;

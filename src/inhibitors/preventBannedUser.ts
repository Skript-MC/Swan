import { Inhibitor } from 'discord-akairo';
import type { Message } from 'discord.js';
import ConvictedUser from '@/app/models/convictedUser';

class PreventBannedUsersInhibitor extends Inhibitor {
  constructor() {
    super('preventBannedUsers', {
      reason: 'preventBannedUsers',
    });
  }

  public async exec(message: Message): Promise<boolean> {
    const result = await ConvictedUser.findOne({ memberId: message.author.id });
    return typeof result?.lastBanId !== 'undefined';
  }
}

export default PreventBannedUsersInhibitor;

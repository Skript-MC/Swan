import { Inhibitor } from 'discord-akairo';
import type { Message } from 'discord.js';
import ConvictedUser from '../models/convictedUser';

class PreventBannedUsersInhibitor extends Inhibitor {
  constructor() {
    super('preventBannedUsers', {
      reason: 'preventBannedUsers',
    });
  }

  public async exec(message: Message): Promise<boolean> {
    const result = await ConvictedUser.findOne({ memberId: message.author.id });
    console.log('DEBUG ~ file: preventBannedUser.ts ~ line 14 ~ PreventBannedUsersInhibitor ~ exec ~ result', result);
    return typeof result?.lastBanId !== 'undefined';
  }
}

export default PreventBannedUsersInhibitor;

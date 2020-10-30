import { Inhibitor } from 'discord-akairo';
import ConvictedUser from '../models/convictedUser';
import { noop } from '../utils';

class PreventBannedUsersInhibitor extends Inhibitor {
  constructor() {
    super('preventBannedUsers', {
      reason: 'preventBannedUsers',
    });
  }

  async exec(message) {
    const result = await ConvictedUser.findOne({ memberId: message.author.id }).catch(noop);
    return typeof result?.lastBanId !== 'undefined';
  }
}

export default PreventBannedUsersInhibitor;

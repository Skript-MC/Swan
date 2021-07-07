import type { AkairoClient } from 'discord-akairo';
import { Inhibitor } from 'discord-akairo';
import type { Message } from 'discord.js';
import ConvictedUser from '@/app/models/convictedUser';
import type { ConvictedUserDocument } from '@/app/types';

class PreventBannedUsersInhibitor extends Inhibitor {
  constructor() {
    super('preventBannedUsers', {
      reason: 'preventBannedUsers',
    });
  }

  public async exec(message: Message): Promise<boolean> {
    const convictedUser = await this._getConvictedUser(this.client, message.author.id);
    return Boolean(convictedUser?.currentBanId);
  }

  private async _getConvictedUser(client: AkairoClient, memberId: string): Promise<ConvictedUserDocument> {
    const cachedUser = client.cache.convictedUsers.find(elt => elt.memberId === memberId);
    if (cachedUser)
      return cachedUser;
    const convictedUser = await ConvictedUser.findOne({ memberId });
    if (convictedUser)
      client.cache.convictedUsers.push(convictedUser);
    return convictedUser;
  }
}

export default PreventBannedUsersInhibitor;

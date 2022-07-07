import { ApplyOptions } from '@sapphire/decorators';
import type { Message } from 'discord.js';
import Sanction from '@/app/models/sanction';
import type { TaskOptions } from '@/app/structures/tasks/Task';
import MessageTask from '@/app/structures/tasks/listeners/MessageTask';
import { SanctionTypes } from '@/app/types';
import { nullop } from '@/app/utils';
import { updateMemberIfBanned as config } from '@/conf/tasks/listeners/messageCreate';

@ApplyOptions<TaskOptions>(config.settings)
export default class UpdateMemberIfBannedTask extends MessageTask {
  public async runListener(message: Message): Promise<boolean> {
    if (this.container.client.cache.channelBannedSilentUsers.has(message.author.id)) {
      const sanction = await Sanction.findOne({
        memberId: message.author.id,
        type: SanctionTypes.Ban,
        revoked: false,
      }).catch(nullop);
      if (!sanction || sanction.informations?.banChannelId !== message.channel.id)
        return false;

      await Sanction.updateOne({ _id: sanction._id }, { $set: { informations: { hasSentMessages: true } } });
      this.container.client.cache.channelBannedSilentUsers.delete(message.author.id);
    }
    return false;
  }
}

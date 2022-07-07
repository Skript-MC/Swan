import { ApplyOptions } from '@sapphire/decorators';
import MessageLog from '@/app/models/messageLog';
import type { TaskOptions } from '@/app/structures/tasks/Task';
import MessageTask from '@/app/structures/tasks/listeners/MessageTask';
import type { GuildMessage } from '@/app/types';
import { logMessageDeletion as config } from '@/conf/tasks/listeners/messageDelete';

@ApplyOptions<TaskOptions>(config.settings)
export default class LogMessageDeletionTask extends MessageTask {
  public async runListener(message: GuildMessage): Promise<boolean> {
    const swanChannel = this.container.client.cache.swanChannels
      .find(channel => channel.id === message.channel.id && channel.logged);
    if (!swanChannel || !message?.content)
      return;
    const messageDoc = await MessageLog.findOne({ messageId: message.id });
    if (messageDoc) {
      messageDoc.editions.push(messageDoc.newContent);
      messageDoc.newContent = null;
      await messageDoc.save();
    } else {
      await MessageLog.create({
        userId: message.member.id,
        messageId: message.id,
        channelId: message.channel.id,
        oldContent: message.content,
      });
    }
    return false;
  }
}

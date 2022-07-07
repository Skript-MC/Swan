import { ApplyOptions } from '@sapphire/decorators';
import MessageLog from '@/app/models/messageLog';
import type { TaskOptions } from '@/app/structures/tasks/Task';
import MessageTask from '@/app/structures/tasks/listeners/MessageTask';
import type { GuildMessage } from '@/app/types';
import { logMessageUpdate as config } from '@/conf/tasks/listeners/messageUpdate';

@ApplyOptions<TaskOptions>(config.settings)
export default class LogMessageUpdateTask extends MessageTask {
  public async runListener(message: GuildMessage, newMessage: GuildMessage): Promise<boolean> {
    const swanChannel = this.container.client.cache.swanChannels
      .find(channel => channel.id === message.channel.id && channel.logged);
    if (!swanChannel || !message?.content)
      return;
    if (message.content === newMessage.content)
      return;
    const messageDoc = await MessageLog.findOne({ messageId: message.id });
    if (messageDoc) {
      const oldNewContent = messageDoc.newContent;
      if (oldNewContent)
        messageDoc.editions.push(oldNewContent);
      messageDoc.newContent = newMessage.content;
      await messageDoc.save();
    } else {
      await MessageLog.create({
        userId: message.member.id,
        messageId: message.id,
        channelId: message.channel.id,
        oldContent: message.content,
        newContent: newMessage.content,
      });
    }
  }
}

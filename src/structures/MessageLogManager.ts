import type { Message, User } from 'discord.js';
import { DiscordUser } from '@/app/models/discordUser';
import { MessageLog } from '@/app/models/messageLog';
import type { SwanCacheManager } from '@/app/structures/SwanCacheManager';
import type { DiscordUserDocument } from '@/app/types';

export function shouldSaveMessage(cache: SwanCacheManager, message: Message): boolean {
  return [...cache.swanChannels].some(swanChannel => swanChannel.logged
      && swanChannel.channelId === message.channel.id);
}

export async function getDiscordUser(cache: SwanCacheManager, author: User): Promise<DiscordUserDocument | null> {
  const cachedUser = cache.discordUsers.find(user => user.userId === author.id);
  if (cachedUser)
    return cachedUser;
  const user = await DiscordUser.findOneOrCreate({
    userId: author.id,
  }, {
    userId: author.id,
    username: author.tag,
    avatarUrl: author.avatarURL(),
  });
  cache.discordUsers.push(user);
  return user;
}

export async function saveMessageEdit(
  cache: SwanCacheManager,
  oldMessage: Message,
  newMessage: Message,
): Promise<void> {
  // We check that the content of the message has changed, since it may not have changed
  if (!this.shouldSaveMessage(cache, oldMessage) || oldMessage.content === newMessage.content)
    return;
  const userDoc: DiscordUserDocument = await this.getDiscordUser(cache, oldMessage.author);
  const messageDoc = await MessageLog.findOne({ messageId: oldMessage.id });
  if (messageDoc) {
    const oldNewContent = messageDoc.newContent;
    if (oldNewContent)
      messageDoc.editions.push(oldNewContent);
    messageDoc.newContent = newMessage.content;
    await messageDoc.save();
  } else {
    await MessageLog.create({
      user: userDoc,
      messageId: oldMessage.id,
      channelId: oldMessage.channel.id,
      oldContent: oldMessage.content,
      newContent: newMessage.content,
    });
  }
}

export async function saveMessageDelete(cache: SwanCacheManager, oldMessage: Message): Promise<void> {
  if (!this.shouldSaveMessage(cache, oldMessage))
    return;
  const userDoc: DiscordUserDocument = await this.getDiscordUser(cache, oldMessage.author);
  const messageDoc = await MessageLog.findOne({ messageId: oldMessage.id });
  if (messageDoc) {
    messageDoc.editions.push(messageDoc.newContent);
    messageDoc.newContent = null;
    await messageDoc.save();
  } else {
    await MessageLog.create({
      user: userDoc,
      messageId: oldMessage.id,
      channelId: oldMessage.channel.id,
      oldContent: oldMessage.content,
    });
  }
}

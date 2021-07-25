import type { AkairoClient } from 'discord-akairo';
import type { Message, User } from 'discord.js';
import DiscordUser from '@/app/models/discordUser';
import MessageLog from '@/app/models/messageLog';
import type { DiscordUserDocument } from '@/app/types';

export default {
  shouldSaveMessage(client: AkairoClient, message: Message): boolean {
    return client.cache.savedChannelsIds?.includes(message.channel.id) || false;
  },

  async getDiscordUser(client: AkairoClient, author: User): Promise<DiscordUserDocument | null> {
    const cachedUser = client.cache.discordUsers.find(elt => elt.userId === author.id);
    if (cachedUser)
      return cachedUser;
    const user = await DiscordUser.findOneOrCreate({
      userId: author.id,
    }, {
      userId: author.id,
      username: author.username,
      avatarUrl: author.avatarURL(),
    });
    client.cache.discordUsers.push(user);
    return user;
  },

  async saveMessageEdit(client: AkairoClient, oldMessage: Message, newMessage: Message): Promise<void> {
    // We check that the content of the message has changed, since it may not have changed
    if (!this.shouldSaveMessage(client, oldMessage) || oldMessage.content === newMessage.content)
      return;
    const userDoc: DiscordUserDocument = await this.getDiscordUser(client, oldMessage.author);
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
  },

  async saveMessageDelete(client: AkairoClient, oldMessage: Message): Promise<void> {
    if (!this.shouldSaveMessage(client, oldMessage))
      return;
    const userDoc: DiscordUserDocument = await this.getDiscordUser(client, oldMessage.author);
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
  },
};

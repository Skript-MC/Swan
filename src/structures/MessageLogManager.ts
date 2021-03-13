import type { AkairoClient } from 'discord-akairo';
import type { Message, User } from 'discord.js';
import discordUser from '@/app/models/discordUser';
import messageHistory from '@/app/models/messageLog';
import type { DiscordUserDocument, MessageLogDocument } from '@/app/types';

export default {
  shouldMessageBeSaved(client: AkairoClient, message: Message): boolean {
    return client.cache.savedChannelsIds?.includes(message.channel.id) || false;
  },

  async getDiscordUser(client: AkairoClient, author: User): Promise<DiscordUserDocument | null> {
    const cachedUser: DiscordUserDocument = client.cache.discordUsers.find(elt => elt.userId === author.id);
    if (cachedUser)
      return cachedUser;
    const user: DiscordUserDocument = await discordUser.findOneOrCreate({
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
    if (!this.shouldMessageBeSaved(client, oldMessage))
      return;
    const userDoc: DiscordUserDocument = await this.getDiscordUser(client, oldMessage.author);
    const messageDoc: MessageLogDocument = await messageHistory.findOne({ messageId: oldMessage.id });
    if (messageDoc) {
      const oldNewContent = messageDoc.newContent;
      if (oldNewContent)
        messageDoc.editions.push(oldNewContent);
      messageDoc.newContent = newMessage.content;
      await messageDoc.save();
    } else {
      await messageHistory.create({
        user: userDoc,
        messageId: oldMessage.id,
        channelId: oldMessage.channel.id,
        oldContent: oldMessage.content,
        newContent: newMessage.content,
      });
    }
  },

  async saveMessageDelete(client: AkairoClient, oldMessage: Message): Promise<void> {
    if (!this.shouldMessageBeSaved(client, oldMessage))
      return;
    const userDoc: DiscordUserDocument = await this.getDiscordUser(client, oldMessage.author);
    const messageDoc: MessageLogDocument = await messageHistory.findOne({ messageId: oldMessage.id });
    if (messageDoc) {
      messageDoc.editions.push(messageDoc.newContent);
      messageDoc.newContent = null;
      await messageDoc.save();
    } else {
      await messageHistory.create({
        user: userDoc,
        messageId: oldMessage.id,
        channelId: oldMessage.channel.id,
        oldContent: oldMessage.content,
      });
    }
  },
};

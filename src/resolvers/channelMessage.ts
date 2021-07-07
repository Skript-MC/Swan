import type { Message } from 'discord.js';
import type { GuildMessage } from '@/app/types';
import { nullop } from '@/app/utils';

async function getMessageById(message: GuildMessage, messageId: string): Promise<Message | null> {
  return message.channel.messages.fetch(messageId).catch(nullop);
}

export default async function channelMessage(message: GuildMessage, phrase: string): Promise<Message | null> {
  if (!phrase)
    return null;

  const linkRegex = new RegExp(`https://(?:ptb.|canary.)?discord(?:app)?.com/channels/${message.guild.id}/(?<channelId>\\d{18})/(?<messageId>\\d{18})`, 'imu');
  if (linkRegex.test(phrase)) {
    const messageId = linkRegex.exec(phrase)!.groups?.messageId;
    if (!messageId)
      return null;
    return await getMessageById(message, messageId);
  }

  const idRegex = /(?<channelId>\d{18})-(?<messageId>\d{18})/imu;
  if (idRegex.test(phrase)) {
    const messageId = idRegex.exec(phrase)!.groups?.messageId;
    if (!messageId)
      return null;
    return await getMessageById(message, messageId);
  }

  return await getMessageById(message, phrase);
}

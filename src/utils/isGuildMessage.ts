import { isGuildBasedChannel } from '@sapphire/discord.js-utilities';
import type { Message, PartialMessage } from 'discord.js';
import type { GuildMessage } from '../types';

/**
 * Checks if a message is a guild message.
 * @param message The message to check
 * @returns Whether the message is a guild message
 */
export default function isGuildMessage(message: Message | PartialMessage): message is GuildMessage {
  return isGuildBasedChannel(message.channel);
}

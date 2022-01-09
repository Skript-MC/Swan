import { isGuildBasedChannel, isTextBasedChannel } from '@sapphire/discord.js-utilities';
import type { Result } from '@sapphire/framework';
import { err, ok, Resolvers } from '@sapphire/framework';
import type { GuildTextBasedChannel, Message } from 'discord.js';

export default function resolveGuildTextBasedChannel(
  parameter: string,
  message: Message,
): Result<GuildTextBasedChannel, 'guildTextBasedChannelError'> {
  const resolved = Resolvers.resolveChannel(parameter, message);

  return isTextBasedChannel(resolved.value) && isGuildBasedChannel(resolved.value)
    ? ok(resolved.value)
    : err('guildTextBasedChannelError');
}

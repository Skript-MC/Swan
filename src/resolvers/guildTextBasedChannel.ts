import { isGuildBasedChannel, isTextBasedChannel } from '@sapphire/discord.js-utilities';
import type { Result } from '@sapphire/framework';
import { err, ok, Resolvers } from '@sapphire/framework';
import type { GuildTextBasedChannel, Message } from 'discord.js';

export default function resolveGuildTextBasedChannel(
  parameter: string,
  message: Message,
): Result<GuildTextBasedChannel, 'guildTextBasedChannelError'> {
  const resolved = Resolvers.resolveChannel(parameter, message);

  if (isTextBasedChannel(resolved.value) && isGuildBasedChannel(resolved.value))
    return ok(resolved.value);
  return err('guildTextBasedChannelError');
}

import { isTextBasedChannel } from '@sapphire/discord.js-utilities';
import type { Result } from '@sapphire/framework';
import { err, ok, Resolvers } from '@sapphire/framework';
import type { Guild, GuildTextBasedChannel } from 'discord.js';

export default function resolveGuildTextBasedChannel(
  parameter: string,
  guild: Guild,
): Result<GuildTextBasedChannel, 'guildTextBasedChannelError'> {
  const resolved = Resolvers.resolveGuildChannel(parameter, guild);

  if (isTextBasedChannel(resolved.value))
    return ok(resolved.value);
  return err('guildTextBasedChannelError');
}

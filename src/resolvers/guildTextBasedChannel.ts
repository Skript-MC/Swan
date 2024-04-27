import type { Result } from '@sapphire/framework';
import { Resolvers, err, ok } from '@sapphire/framework';
import type { Guild, GuildTextBasedChannel } from 'discord.js';

export function resolveGuildTextBasedChannel(
  parameter: string,
  guild: Guild,
): Result<GuildTextBasedChannel, 'guildTextBasedChannelError'> {
  const resolved = Resolvers.resolveGuildChannel(parameter, guild).unwrap();

  if (resolved.isTextBased()) return ok(resolved);
  return err('guildTextBasedChannelError');
}

import type { Result } from '@sapphire/framework';
import { err, ok, Resolvers } from '@sapphire/framework';
import type { Guild, GuildTextBasedChannel } from 'discord.js';

export default function resolveGuildTextBasedChannel(
  parameter: string,
  guild: Guild,
): Result<GuildTextBasedChannel, 'guildTextBasedChannelError'> {
  const resolved = Resolvers.resolveGuildChannel(parameter, guild);

  if (resolved.unwrap().isTextBased())
    return ok(resolved.unwrap() as GuildTextBasedChannel);
  return err('guildTextBasedChannelError');
}

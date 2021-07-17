import { ApplyOptions } from '@sapphire/decorators';
import type { ArgumentResult, ExtendedArgumentContext, ExtendedArgumentOptions } from '@sapphire/framework';
import { ExtendedArgument } from '@sapphire/framework';
import type { GuildChannel } from 'discord.js';
import type { GuildTextBasedChannel } from '@/app/types';

@ApplyOptions<ExtendedArgumentOptions<'guildChannel'>>({ name: 'guildTextBasedChannel', baseArgument: 'guildChannel' })
export default class GuildTextBasedChannelArgument extends ExtendedArgument<'guildChannel', GuildTextBasedChannel> {
  public handle(channel: GuildChannel, context: ExtendedArgumentContext): ArgumentResult<GuildTextBasedChannel> {
    return channel.type === 'text' || channel.type === 'news'
      ? this.ok(channel as GuildTextBasedChannel)
      : this.error({
          parameter: context.parameter,
          message: 'The argument did not resolve to a text or news channel.',
          context: { ...context, channel },
        });
  }
}

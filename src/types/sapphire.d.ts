import type { Guild, GuildEmoji, GuildMember } from 'discord.js';
import type SwanCacheManager from '@/app/structures/SwanCacheManager';
import type SwanCommand from '@/app/structures/commands/SwanCommand';
import type { GuildTextBasedChannel } from '@/app/types';

declare module '@sapphire/framework' {
  enum Events {
    TaskError = 'taskError',
  }

  interface SapphireClient {
    cache: SwanCacheManager;

    currentlyBanning: Set<string>;
    currentlyUnbanning: Set<string>;
    currentlyModerating: Set<string>;
    isLoading: boolean;

    guild: Guild;

    checkValidity(): void;
  }

  interface ArgType {
    command: SwanCommand;
    duration: number;
    emoji: GuildEmoji;
    guildTextBasedChannel: GuildTextBasedChannel;
    sanctionnableMember: GuildMember;
  }
}

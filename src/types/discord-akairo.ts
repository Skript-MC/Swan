import type {
  CommandHandler,
  InhibitorHandler,
  ListenerHandler,
} from 'discord-akairo';
import type { Guild } from 'discord.js';
import type SwanCacheManager from '@/app/structures/SwanCacheManager';
import type TaskHandler from '@/app/structures/TaskHandler';
import type { GuildMessage } from './index';


declare module 'discord-akairo' {
  interface CommandDetails {
    name: string;
    content: string;
    usage: string;
    examples: string[];
    permissions?: string;
  }

  interface CommandOptions {
    details: CommandDetails;
  }

  interface Command {
    rules?: number[];
    details: CommandDetails;

    // We add a signature where the message is of type GuildMessage, which can be useful
    // when the `channel: "guild"` option is given in the constructor options.
    exec(message: GuildMessage, args: unknown): unknown;
  }

  interface AkairoModule {
    toString(): string;
  }

  interface AkairoClient {
    cache: SwanCacheManager;

    currentlyBanning: Set<string>;
    currentlyUnbanning: Set<string>;
    currentlyModerating: Set<string>;
    isLoading: boolean;

    commandHandler: CommandHandler;
    inhibitorHandler: InhibitorHandler;
    taskHandler: TaskHandler;
    listenerHandler: ListenerHandler;

    guild: Guild;

    checkValidity(): void;
  }
}

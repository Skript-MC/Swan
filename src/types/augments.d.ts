import type { Guild } from 'discord.js';
import type { SwanCacheManager } from '#structures/SwanCacheManager';
import type { TaskStore } from '#structures/tasks/TaskStore';

declare module '@sapphire/framework' {
  interface StoreRegistryEntries {
    tasks: TaskStore;
  }

  interface Preconditions {
    NotLoading: never;
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

  enum Identifiers {
    PreconditionNotLoading = 'preconditionNotLoading',
  }
}

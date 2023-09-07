import type { Guild } from 'discord.js';
import type { SwanCacheManager } from '#structures/SwanCacheManager';
import type { TaskStore } from '#structures/tasks/TaskStore';

declare module '@sapphire/framework' {
  interface StoreRegistryEntries {
    tasks: TaskStore;
  }

  interface Preconditions {
    /* eslint-disable @typescript-eslint/naming-convention */
    NotLoading: never;
    /* eslint-enable @typescript-eslint/naming-convention */
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

import type {
  ArgOptions,
  ArgumentError,
  ArgumentResult,
  IArgument,
  RepeatArgOptions,
  Result,
} from '@sapphire/framework';
import type {
  Guild,
  GuildMember,
  GuildTextBasedChannel,
  User,
} from 'discord.js';
import type { SwanCacheManager } from '@/app/structures/SwanCacheManager';
import type { SwanCommand } from '@/app/structures/commands/SwanCommand';
import type { TaskStore } from '@/app/structures/tasks/TaskStore';

declare module '@sapphire/framework' {
  interface StoreRegistryEntries {
    tasks: TaskStore;
  }

  interface Args {
    pickResult<T>(type: IArgument<T>, options?: ArgOptions): Promise<Result<T, ArgumentError>>;
    pickResult<K extends keyof ArgType>(type: K, options?: ArgOptions): Promise<Result<ArgType[K], ArgumentError>>;

    restResult<T>(type: IArgument<T>, options?: ArgOptions): Promise<Result<T, ArgumentError>>;
    restResult<K extends keyof ArgType>(type: K, options?: ArgOptions): Promise<Result<ArgType[K], ArgumentError>>;

    repeatResult<T>(type: IArgument<T>, options?: RepeatArgOptions): Promise<Result<T[], ArgumentError>>;
    repeatResult<K extends keyof ArgType>(
      type: K,
      options?: RepeatArgOptions,
    ): Promise<Result<Array<ArgType[K]>, ArgumentError>>;

    peekResult<T>(type: () => ArgumentResult<T>): Promise<Result<T, ArgumentError>>;
    peekResult<T>(type: IArgument<T>, options?: ArgOptions): Promise<Result<T, ArgumentError>>;
    peekResult<K extends keyof ArgType>(
      type: K | (() => ArgumentResult<ArgType[K]>),
      options?: ArgOptions
    ): Promise<Result<ArgType[K], ArgumentError>>;
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

  interface ArgType {
    bannedMember: GuildMember | User;
    command: SwanCommand;
    duration: number;
    emoji: string;
    guildTextBasedChannel: GuildTextBasedChannel;
    quotedText: string[];
    sanctionnableMember: GuildMember;
  }
}

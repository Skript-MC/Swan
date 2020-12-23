import type {
  CommandHandler,
  InhibitorHandler,
  ListenerHandler,
} from 'discord-akairo';
import type { Guild, TextChannel } from 'discord.js';
import type TaskHandler from '../structures/TaskHandler';


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
  }

  interface CachedChannels {
    idea: TextChannel;
    suggestions: TextChannel;
    bot: TextChannel;
    main: TextChannel;
    snippets: TextChannel;
    skriptHelp: TextChannel[];
    otherHelp: TextChannel[];
    help: TextChannel[];
    skriptTalk: TextChannel;
    creations: TextChannel;
    log: TextChannel;
    privateChannelsCategory: TextChannel;
  }

  interface AkairoClient {
    addonsVersions: string[];
    currentlyBanning: string[];
    currentlyUnbanning: string[];
    cachedChannels: CachedChannels;
    isLoading: boolean;

    commandHandler: CommandHandler;
    inhibitorHandler: InhibitorHandler;
    taskHandler: TaskHandler;
    listenerHandler: ListenerHandler;

    guild: Guild;


    checkValidity(): void;
  }
}

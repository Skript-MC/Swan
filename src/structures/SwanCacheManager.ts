import type { AkairoModule } from 'discord-akairo';
import type { TextChannel } from 'discord.js';
import type {
  GithubPrerelease,
  GithubStableRelease,
  Nullable,
  SkriptMcDocumentationSyntaxResponse,
} from '@/app/types';

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

interface GithubCache {
  lastPrerelease?: GithubPrerelease;
  lastStableRelease?: GithubStableRelease;
}

class SwanCacheManager {
  addonsVersions: string[];
  skriptMcSyntaxes: SkriptMcDocumentationSyntaxResponse[];
  pollMessagesIds: string[];
  channels: Nullable<CachedChannels>;
  modules: AkairoModule[];
  github: GithubCache;

  constructor() {
    this.channels = {
      idea: null,
      suggestions: null,
      bot: null,
      main: null,
      snippets: null,
      skriptHelp: null,
      otherHelp: null,
      help: null,
      skriptTalk: null,
      creations: null,
      log: null,
      privateChannelsCategory: null,
    };
    this.addonsVersions = [];
    this.skriptMcSyntaxes = [];
    this.github = {};
    this.pollMessagesIds = [];
    this.modules = [];
  }
}

export default SwanCacheManager;

import type {
  CachedChannels,
  DiscordUserDocument,
  GithubPrerelease,
  GithubStableRelease,
  SkriptMcDocumentationSyntaxAndAddon,
  SkriptToolsAddonList,
  SwanChannelDocument,
} from '@/app/types';

interface GithubCache {
  lastPrerelease?: GithubPrerelease;
  lastStableRelease?: GithubStableRelease;
}

export class SwanCacheManager {
  skriptToolsAddons: SkriptToolsAddonList;
  skriptMcSyntaxes: SkriptMcDocumentationSyntaxAndAddon[];
  pollMessagesIds: Set<string>;
  reactionRolesIds: Set<string>;
  channels: CachedChannels;
  github: GithubCache;
  gitCommit: string;
  discordUsers: DiscordUserDocument[];
  swanChannels: Set<SwanChannelDocument>;

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
      forumUpdates: null,
      banChannel: null,
    };
    this.skriptToolsAddons = {};
    this.skriptMcSyntaxes = [];
    this.github = {};
    this.pollMessagesIds = new Set();
    this.reactionRolesIds = new Set();
    // This.modules = [];
    this.gitCommit = '';
    this.discordUsers = [];
    this.swanChannels = new Set();
  }
}

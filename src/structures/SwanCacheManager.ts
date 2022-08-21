import type {
  CachedChannels,
  DiscordUserDocument,
  GithubPrerelease,
  GithubStableRelease,
  SkriptMcDocumentationSyntaxAndAddon,
  SwanChannelDocument,
} from '@/app/types';

interface GithubCache {
  lastPrerelease?: GithubPrerelease;
  lastStableRelease?: GithubStableRelease;
}

export default class SwanCacheManager {
  addonsVersions: string[];
  skriptMcSyntaxes: SkriptMcDocumentationSyntaxAndAddon[];
  pollMessagesIds: Set<string>;
  reactionRolesIds: Set<string>;
  channels: CachedChannels;
  // Modules: AkairoModule[];
  github: GithubCache;
  gitCommit: string;
  discordUsers: DiscordUserDocument[];
  swanChannels: Set<SwanChannelDocument>;
  channelBannedSilentUsers: Set<string>;

  constructor() {
    this.channels = {
      idea: null,
      suggestions: null,
      bot: null,
      main: null,
      snippets: null,
      skriptHelp: null,
      skriptExtraHelp: null,
      otherHelp: null,
      help: null,
      skriptTalk: null,
      creations: null,
      log: null,
      privateChannelsCategory: null,
      forumUpdates: null,
    };
    this.addonsVersions = [];
    this.skriptMcSyntaxes = [];
    this.github = {};
    this.pollMessagesIds = new Set();
    this.reactionRolesIds = new Set();
    // This.modules = [];
    this.gitCommit = '';
    this.discordUsers = [];
    this.swanChannels = new Set();
    this.channelBannedSilentUsers = new Set();
  }
}

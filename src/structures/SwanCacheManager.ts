import type {
  CachedChannels,
  ConvictedUserDocument,
  DiscordUserDocument,
  GithubPrerelease,
  GithubStableRelease,
  Nullable,
  SkriptMcDocumentationSyntaxAndAddon,
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
  channels: Nullable<CachedChannels>;
  // modules: AkairoModule[];
  github: GithubCache;
  gitCommit: string;
  discordUsers: DiscordUserDocument[];
  savedChannelsIds: string[];
  convictedUsers: ConvictedUserDocument[];

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
    // this.modules = [];
    this.gitCommit = '';
    this.discordUsers = [];
    this.savedChannelsIds = [];
    this.convictedUsers = [];
  }
}

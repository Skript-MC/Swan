import type { AkairoModule } from 'discord-akairo';
import type {
  CachedChannels, ConvictedUserDocument,
  DiscordUserDocument,
  GithubPrerelease,
  GithubStableRelease,
  Nullable,
  SkriptMcDocumentationSyntaxAndAddon,
  SwanChannelDocument,
} from '@/app/types';

interface GithubCache {
  lastPrerelease?: GithubPrerelease;
  lastStableRelease?: GithubStableRelease;
}

class SwanCacheManager {
  addonsVersions: string[];
  skriptMcSyntaxes: SkriptMcDocumentationSyntaxAndAddon[];
  pollMessagesIds: Set<string>;
  reactionRolesIds: Set<string>;
  channels: Nullable<CachedChannels>;
  modules: AkairoModule[];
  github: GithubCache;
  gitCommit: string;
  discordUsers: DiscordUserDocument[];
  swanChannels: Set<SwanChannelDocument>;
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
    this.modules = [];
    this.gitCommit = '';
    this.discordUsers = [];
    this.swanChannels = new Set();
    this.convictedUsers = [];
  }
}

export default SwanCacheManager;

import type { AkairoModule } from 'discord-akairo';
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

class SwanCacheManager {
  addonsVersions: string[];
  skriptMcSyntaxes: SkriptMcDocumentationSyntaxAndAddon[];
  pollMessagesIds: string[];
  reactionRolesIds: string[];
  channels: Nullable<CachedChannels>;
  modules: AkairoModule[];
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
    this.pollMessagesIds = [];
    this.reactionRolesIds = [];
    this.modules = [];
    this.gitCommit = '';
    this.discordUsers = [];
    this.savedChannelsIds = [];
    this.convictedUsers = [];
  }
}

export default SwanCacheManager;

import type {
  DiscordUserDocument,
  GithubPrerelease,
  GithubStableRelease,
  SkriptMcDocumentationSyntaxAndAddon,
  SkriptToolsAddonList,
  SwanChannelDocument,
} from '#types/index';

interface GithubCache {
  lastPrerelease?: GithubPrerelease;
  lastStableRelease?: GithubStableRelease;
}

export class SwanCacheManager {
  skriptToolsAddons: SkriptToolsAddonList = {};
  skriptMcSyntaxes: SkriptMcDocumentationSyntaxAndAddon[] = [];

  github: GithubCache = {};
  gitCommit = '';
  gitTag = '';
  discordUsers: DiscordUserDocument[] = [];
  swanChannels = new Set<SwanChannelDocument>();
}

import type {
  GithubPrerelease,
  GithubStableRelease,
  SkriptMcDocumentationSyntaxAndAddon,
  SkriptToolsAddonList,
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
}

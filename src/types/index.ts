import type { Endpoints } from '@octokit/types';
import type { CommandOptions } from '@sapphire/framework';
import type { Message, PermissionResolvable } from 'discord.js';
import type { Document, Model } from 'mongoose';

/* ****************** */
/*  API Result Types  */
/* ****************** */

// #region API Result Types (VS Code)
// region API Result Types (JetBrains)

/** Types for the Github API's releases endpoint */
type RawGithubReleaseResponse = Endpoints['GET /repos/{owner}/{repo}/releases']['response'];
type GithubRelease = RawGithubReleaseResponse['data'][0];

export type GithubPrerelease = GithubRelease & { prerelease: true };
export type GithubStableRelease = GithubRelease & { prerelease: false };

/**
 * Represent the object that is returned when calling the skripttools API
 * when requesting informations for a specific addon.
 */
export interface SkriptToolsAddonResponse {
  author: string[];
  plugin: string;
  version: string;
  description?: string;
  unmaintained: boolean;
  bytes: string;
  download: string;
  sourcecode?: string;
  depend?: {
    depend?: string[];
    softdepend?: string[];
    loadbefore?: string[];
  };
}

/** Represent the object that is returned when calling the skripttools API to get all addons */
export type SkriptToolsAddonList = Record<string, string[] | null>;

/**
 * Represent the objects that are in the "articles" array that is returned
 * when calling the Skript-MC's API when requesting a specific addon.
 */
export interface SkriptMcDocumentationSyntaxResponse {
  id: number;
  addon: string;
  name: string;
  frenchName?: string;
  englishName?: string;
  content: string;
  version: string;
  example: string;
  pattern: string;
  category: 'conditions' | 'effets' | 'evenements' | 'expressions' | 'fonctions' | 'types';
  documentationUrl: string;
  deprecation?: string | null;
  deprecationLink?: string | null;
}

/**
 * Represent the objects that are in the "articles" array that is returned
 * when calling the Skript-MC's API when requesting a specific addon.
 */
export interface SkriptMcDocumentationSyntaxAndAddon extends Omit<SkriptMcDocumentationSyntaxResponse, 'addon'> {
  addon: Pick<SkriptMcDocumentationAddonResponse, 'dependency' | 'documentationUrl' | 'name'>;
}

/** Represent the object that is returned by the Skript-MC's API for addons, without the syntax list */
export interface SkriptMcDocumentationAddonResponse {
  id: number;
  name: string;
  version: string;
  description: string;
  slug: string;
  github: string;
  author: string;
  documentationUrl: string;
  dependency?: string | null;
}

/** Represent a server object from the McSrvStat's API. */
export interface ServerStatResponse {
  online: boolean;
  ip: string;
  port: number;
  motd: {
    raw: string[];
    clean: string[];
    html: string[];
  };
  players: {
    online: number;
    max: number;
  };
  version: string;
  protocol?: number;
  hostname?: string;
  icon?: string;
  software?: string;
  plugins?: {
    names: string[];
    raw: string[];
  };
  mods?: {
    names: string[];
    raw: Record<number, string>;
  };
}

/** Represent a category object from the Skript-MC's Invision forums API. */
export interface InvisionCategory {
  id: number;
  name: string;
  url: string;
  class: string;
  parentId: number;
}

/** Represent the object that is returned by the Skript-MC's API for addons */
export interface SkriptMcDocumentationFullAddonResponse extends SkriptMcDocumentationAddonResponse {
  articles: SkriptMcDocumentationSyntaxResponse[];
}

/** Represent a file object from the Skript-MC's Invision forums API. */
export interface InvisionFile {
  name: string;
  url: string;
  size: number;
}

/** Represent a forum object from the Skript-MC's Invision forums API. */
export interface InvisionForum {
  id: number;
  name: string;
  path: string;
  topics: number;
  url: string;
  parentId?: number;
}

/** Represent the resource history response object that is returned by the Skript-MC's Invision forums API. */
export interface InvisionUpdate {
  version: string;
  changelog: string;
  date: string;
}

/** Represent the resource response object that is returned by the Skript-MC's Invision forums API. */
export interface InvisionFullResource extends InvisionResponse {
  results: InvisionResource[];
}

/** Represent the topic response object that is returned by the Skript-MC's Invision forums API. */
export interface InvisionFullTopic extends InvisionResponse {
  results: InvisionTopic[];
}

/** Represent a group object from the Skript-MC's Invision forums API. */
export interface InvisionGroup {
  id: number;
  name: string;
  formattedName: string;
}

/** Represent a member object from the Skript-MC's Invision forums API. */
export interface InvisionMember {
  id: number;
  name: string;
  title: string;
  timezone: string;
  formattedName: string;
  primaryGroup: InvisionGroup;
  secondaryGroups: InvisionGroup[];
  photoUrl: string;
  photoUrlIsDefault: boolean;
  coverPhotoUrl: string;
  profileUrl?: string;
  validating: boolean;
  posts: number;
}

/** Represent a post object from the Skript-MC's Invision forums API. */
export interface InvisionPost {
  id: number;
  item_id: number;
  author: InvisionMember;
  date: string;
  content: string;
  hidden: boolean;
  url: string;
}

/** Represent the base response object that is returned by the Skript-MC's Invision forums API. */
export interface InvisionResponse {
  page: number;
  perPage: number;
  totalResults: number;
  totalPages: number;
}

/** Represent a resource object from the Skript-MC's Invision forums API. */
export interface InvisionResource {
  id: number;
  title: string;
  category: InvisionCategory;
  author: InvisionMember;
  date: string;
  updated: string;
  description: string;
  version: string;
  changelog: string;
  files: InvisionFile[];
  primaryScreenshot: InvisionFile;
  screenshots: InvisionFile[];
  screenshotsThumbnails: InvisionFile[];
  primaryScreenshotThumb: InvisionFile;
  downloads: number;
  comments: number;
  reviews: number;
  views: number;
  prefix?: string;
  tags: string[];
  locked: boolean;
  hidden: boolean;
  pinned: boolean;
  featured: boolean;
  url: string;
  topic: InvisionTopic;
  isPaid: boolean;
  prices: number[];
  rating: number;
  purchases: number;
  hasPendingVersion: boolean;
}

/** Represent a resource comment object from the Skript-MC's Invision forums API. */
export interface InvisionResourceComment {
  id: number;
  item_id: number;
  author: InvisionMember;
  date: string;
  content: string;
  hidden: boolean;
  url: string;
}

/** Represent a resource field object from the Skript-MC's Invision forums API. */
export interface InvisionResourceField {
  name: string;
  value: string;
}

/** Represent a resource field group object from the Skript-MC's Invision forums API. */
export interface InvisionResourceFieldGroup {
  name: string;
  fields: InvisionResourceField[];
}

/** Represent the object that is returned by the Skript-MC's Invision forums API for search results */
export interface InvisionSearchResult {
  title: string;
  content: string;
  class: string;
  objectId: number;
  itemClass: string;
  itemId: number;
  started: string;
  updated: string;
  itemUrl: string;
  objectUrl: string;
  reputation: number;
  comments?: number;
  reviews?: number;
  container: string;
  containerUrl: string;
  author: string;
  authorUrl?: string;
  authorPhoto: string;
  authorPhotoThumbnail: string;
  tags: string[];
}
/** Represent a topic object from the Skript-MC's Invision forums API. */
export interface InvisionTopic {
  id: number;
  title: string;
  forum: InvisionForum;
  posts: number;
  views: number;
  prefix: string;
  tags: string[];
  firstPost: InvisionPost;
  lastPost: InvisionPost;
  bestAnswer: InvisionPost;
  locked: boolean;
  hidden: boolean;
  pinned: boolean;
  featured: boolean;
  archived: boolean;
  url: string;
  rating: number;
}

export interface SuggestionUser {
  username: string;
  discordId: string | null;
}

export interface Suggestion {
  upVotes: number;
  downVotes: number;
  user: SuggestionUser;
  id: number;
  type: number;
  status: number;
  description: string;
  response: string | null;
  discordSync: boolean;
  discordId: string | null;
  created_at: string;
}

export interface SuggestionResponse {
  loginUrl: string | null;
  suggestion: Suggestion | null;
}

export interface VoteResponse extends SuggestionResponse {
  status: 'ALREADY_VOTED' | 'NO_SELFVOTE' | 'OK' | 'UNLINKED';
}

export interface PublishResponse extends SuggestionResponse {
  status: 'PUBLISHED' | 'UNLINKED';
}

// #endregion

/* ********************************************* */
/*  Miscellaneous types used at specific places  */
/* ********************************************* */

// #region Miscellaneous types used at specific places (VS Code)
// region Miscellaneous types used at specific places (JetBrains)

/** Options for the SwanCommand class */
export interface SwanCommandOptions extends CommandOptions {
  command: string;
  dmPermission?: boolean;
  defaultMemberPermissions?: PermissionResolvable;
}

/** Enforces that the message is cached in a guild */
export type GuildMessage = Message<true>;

// #endregion

/* ************************** */
/*  Various Moderation Types  */
/* ************************** */

// #region Various Moderation Types (VS Code)
// region Various Moderation Types (JetBrains)

/** The object returned by ModerationData#toSchema */
export interface ModerationDataResult {
  memberId: string;
  type: SanctionTypes;
  moderator: string;
  start: number;
  finish: number;
  duration: number;
  reason: string;
  revoked: boolean;
  sanctionId: string;
}

// TODO: Better type the sanction types with 2 distincts types: creations and revokations.
// If we do that, then we will need to find a better way to create the SanctionTypes enum.
// We can take inspiration from https://stackoverflow.com/a/55827534/11687747

/** Sanctions types that *create* a new sanction */
// export enum SanctionCreations {
//   Hardban = 'hardban',
//   Ban = 'ban',
//   Mute = 'mute',
//   Warn = 'warn',
//   Kick = 'kick',
// }

/** Sanctions types that *revoke* a new sanction */
// export enum SanctionRevokations {
//   Unban = 'unban',
//   Unmute = 'unmute',
//   RemoveWarn = 'removeWarn',
// }

/** Different types of possible sanctions */
export enum SanctionTypes {
  Hardban = 'hardban',
  TempBan = 'tempBan',
  Mute = 'mute',
  Warn = 'warn',
  Kick = 'kick',
  Unban = 'unban',
  Unmute = 'unmute',
  RemoveWarn = 'removeWarn',
}

/** Types of sanction updates */
export enum SanctionsUpdates {
  Revoked = 'revoked',
  Duration = 'duration',
}

// #endregion

/* **************************** */
/*  CommandStat Database Types  */
/* **************************** */

// #region CommandStat Database Types (VS Code)
// region CommandStat Database Types (JetBrains)

/** Interface for the "CommandStat"'s mongoose schema */
export interface CommandStatBase {
  commandId: string;
  uses: number;
}

/** Interface for the "CommandStat"'s mongoose document */
export interface CommandStatDocument extends CommandStatBase, Document {}

/** Interface for the "CommandStat"'s mongoose model */
export type CommandStatModel = Model<CommandStatDocument>;

// #endregion

/* ************************ */
/*  Message Database Types  */
/* ************************ */

// #region Message Database Types (VS Code)
// region Message Database Types (JetBrains)

export enum MessageName {
  AutoMessage = 'auto',
  ErrorDetail = 'error',
  AddonPack = 'addonpack',
  Rule = 'rule',
  Joke = 'joke',
}

/** Interface for the "Message"'s mongoose schema */
export interface MessageBase {
  messageType: MessageName;
  name: string;
  aliases: string[];
  content: string;
}

/** Interface for the "Message"'s mongoose document */
export interface MessageDocument extends MessageBase, Document {}

/** Interface for the "Message"'s mongoose model */
export type MessageModel = Model<MessageDocument>;

// #endregion

/* ************************* */
/*  Sanction Database Types  */
/* ************************* */

// #region Sanction Database Types (VS Code)
// region Sanction Database Types (JetBrains)

/** Type of updates in SanctionDocument.updates */
export interface SanctionUpdate {
  date: number;
  moderator: string;
  type: SanctionsUpdates;
  valueBefore?: number;
  valueAfter?: number;
  reason: string;
}

/**
 * Interface for the "Sanction"'s mongoose document.
 */
export interface SanctionDocument extends Document {
  userId: string;
  type: SanctionTypes;
  moderator: string;
  start: number;
  duration?: number;
  finish?: number;
  reason: string;
  revoked?: boolean;
  sanctionId: string;
  updates?: SanctionUpdate[];
}

/** Interface for the "Sanction"'s mongoose model */
export type SanctionModel = Model<SanctionDocument>;

// #endregion

/* ****************************** */
/*         Utilities Types        */
/* ****************************** */

// #region Utilities Types (VS Code)
// region Utilities Types (JetBrains)

/** Interface for the "SimilarityMatch"'s utility type */
export interface SimilarityMatch {
  matchedName: string;
  baseName: string;
  distance: number;
}

// #endregion

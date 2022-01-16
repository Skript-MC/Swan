import type { Endpoints } from '@octokit/types';
import type { CommandOptions } from '@sapphire/framework';
import type { StoreRegistryEntries } from '@sapphire/pieces';
import type {
  Guild,
  GuildMember,
  GuildTextBasedChannel,
  Message,
  User,
} from 'discord.js';
import type {
  Document,
  FilterQuery,
  Model,
  Types,
} from 'mongoose';
import type settings from '@/conf/settings';

/* ****************** */
/*  API Result Types  */
/* ****************** */

// #region API Result Types (VS Code)
// region API Result Types (JetBrains)

/** Types for the Github API's releases endpoint */
type RawGithubReleaseResponse = Endpoints['GET /repos/{owner}/{repo}/releases']['response'];

export type GithubRelease = RawGithubReleaseResponse['data'][0];
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
export type SkriptToolsAddonListResponse = Record<string, string[] | null>;

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
    raw: string[];
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
  // eslint-disable-next-line @typescript-eslint/naming-convention
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
  // eslint-disable-next-line @typescript-eslint/naming-convention
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

// #endregion

/* ********************************************* */
/*  Miscellaneous types used at specific places  */
/* ********************************************* */

// #region Miscellaneous types used at specific places (VS Code)
// region Miscellaneous types used at specific places (JetBrains)

/** Options for the SwanCommand class */
export interface SwanCommandOptions extends CommandOptions {
  usage: string;
  examples: string[];
  permissions?: string[];
}

/** Types of rules for where a command can be executed */
export enum Rules {
  OnlyBotChannel = 1,
  NoHelpChannel = 1 << 1,
  OnlyHelpChannel = 1 << 2,
}

/** Activity types, with the string as a value */
export enum ActivityType {
  PLAYING = 'PLAYING',
  STREAMING = 'STREAMING',
  LISTENING = 'LISTENING',
  WATCHING = 'WATCHING',
  CUSTOM = 'CUSTOM',
  COMPETING = 'COMPETING',
}

/** Represent an addon that matches the requirements, used in commands/addonInfo.ts */
export interface MatchingAddon {
  file: string;
  name: string;
}

/** Enforces that message.channel is a TextChannel or NewsChannel, not a DMChannel. */
export type GuildMessage = Message & { channel: GuildTextBasedChannel; member: GuildMember; guild: Guild };

/** Union type of all the channel we cache */
export type ChannelSlug = keyof typeof settings.channels;

/** All properties containing a array of channels */
export type ChannelArraySlugs = 'help' | 'otherHelp' | 'skriptExtraHelp' | 'skriptHelp';

/** All properties containing a single channel */
export type ChannelSingleSlug = Exclude<ChannelSlug, ChannelArraySlugs>;

/** Record of all the channel we cache internally */
export type CachedChannels =
  & Record<ChannelArraySlugs, GuildTextBasedChannel[]>
  & Record<ChannelSingleSlug, GuildTextBasedChannel>;

// #endregion

/* ************************** */
/*  Various Moderation Types  */
/* ************************** */

// #region Various Moderation Types (VS Code)
// region Various Moderation Types (JetBrains)

export interface BanChannelMessage {
  id: string;
  content: string;
  authorName: string;
  authorId: string;
  sentAt: number;
  edited?: number | null;
  attachments: Array<{ name: string; url: string }>;
}

/** The sanctions types that we track in the ConvictedUser database */
export type TrackedSanctionTypes = SanctionTypes.Ban | SanctionTypes.Hardban | SanctionTypes.Mute;

/** The name of the fields of the TrackedSanctionTypes */
export type TrackedFieldNames = 'currentBanId' | 'currentMuteId';

/** Represent the victim object of ModerationData#victim */
export interface PersonInformations {
  id?: string;
  user?: User;
  member?: GuildMember;
}

/** Extra sanctions informations in SanctionDocument#informations */
export interface SanctionInformations {
  shouldAutobanIfNoMessages?: boolean;
  banChannelId?: string;
  hasSentMessages?: boolean;
}

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
  informations: SanctionInformations;
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
  Ban = 'ban',
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

/* **************************** */
/*     Module Database Types    */
/* **************************** */

// #region Module Database Types (VS Code)
// region Module Database Types (JetBrains)

/** Interface for the "Module"'s mongoose schema */
export interface SwanModuleBase {
  name: string;
  store: keyof StoreRegistryEntries;
  location: {
    relative: string;
    root: string;
  };
  enabled: boolean;
}

/** Interface for the "Module"'s mongoose document */
export interface SwanModuleDocument extends SwanModuleBase, Document {}

/** Interface for the "Module"'s mongoose model */
export type SwanModuleModel = Model<SwanModuleDocument>;

// #endregion

/* ********************* */
/*  Poll Database Types  */
/* ********************* */

// #region Poll Database Types (VS Code)
// region Poll Database Types (JetBrains)

/** The different question types available for the poll command */
export enum QuestionType {
  Yesno,
  Choice,
}

/** Interface for the "Poll"'s mongoose schema */
export interface PollBase {
  messageId: string;
  memberId: string;
  channelId: string;
  finish: number;
  duration: number;
  questionType: QuestionType;
  // Object of reaction's name (i.e. "2⃣'"), with the array of ids of users whom choose this answer.
  votes: Record<string, string[]>;
  question: string;
  customAnswers?: string[];
  anonymous: boolean;
  multiple: boolean;
}

/** Interface for the "Poll"'s mongoose document */
export interface PollDocument extends PollBase, Document {}

/** Interface for the "Poll"'s mongoose model */
export type PollModel = Model<PollDocument>;

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

/* ****************************** */
/*  ConvictedUser Database Types  */
/* ****************************** */

// #region ConvictedUser Database Types (VS Code)
// region ConvictedUser Database Types (JetBrains)

/** Interface for the "ConvictedUser"'s mongoose schema */
export interface ConvictedUserBase {
  memberId: string;
  currentBanId?: string | null;
  currentMuteId?: string | null;
  currentWarnCount?: number | null;
}

/** Interface for the "ConvictedUser"'s mongoose document */
export interface ConvictedUserDocument extends ConvictedUserBase, Document {}

/** Interface for the "ConvictedUser"'s mongoose model */
export interface ConvictedUserModel extends Model<ConvictedUserDocument> {
  findOneOrCreate(
    condition: FilterQuery<ConvictedUserDocument>,
    doc: ConvictedUserBase,
  ): Promise<ConvictedUserDocument>;
}

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

/** Interface for the "Sanction"'s mongoose schema */
export interface SanctionBase {
  memberId: string;
  user: ConvictedUserDocument | Types.ObjectId;
  type: SanctionTypes;
  moderator: string;
  start: number;
  duration?: number;
  finish?: number;
  reason: string;
  revoked?: boolean;
  sanctionId: string;
  informations?: SanctionInformations;
  updates?: SanctionUpdate[];
}

/**
 * Interface for the "Sanction"'s mongoose document.
 * It is not meant to be used, it is just a base which extends document, and modify SanctionBase to use
 * mongoose's types (allow things like .addToSet on the mongoose array)
 */
interface SanctionBaseDocument extends SanctionBase, Document {
  updates?: Types.Array<SanctionUpdate>;
}

/** Interface for the "Sanction"'s mongoose document, when the user field is not populated */
export interface SanctionDocument extends SanctionBaseDocument {
  user: ConvictedUserDocument['_id'];
}

/** Interface for the "Sanction"'s mongoose document, when the user field is populated */
export interface SanctionPopulatedDocument extends SanctionBaseDocument {
  user: ConvictedUserDocument;
}

/** Interface for the "Sanction"'s mongoose model */
export type SanctionModel = Model<SanctionDocument>;

// #endregion

/* ***************************** */
/*  ReactionRole Database Types  */
/* ***************************** */

// #region ReactionRole Database Types (VS Code)
// region ReactionRole Database Types (JetBrains)

/** Interface for the "ReactionRole"'s mongoose schema */
export interface ReactionRoleBase {
  messageId: string;
  channelId: string;
  givenRoleId: string;
  reaction: string;
}

/** Interface for the "ReactionRole"'s mongoose document */
export interface ReactionRoleDocument extends ReactionRoleBase, Document {}

/** Interface for the "ReactionRole"'s mongoose model */
export type ReactionRoleModel = Model<ReactionRoleDocument>;

// #endregion

/* ****************************** */
/*   DiscordUser Database Types   */
/* ****************************** */

// #region DiscordUser Database Types (VS Code)
// region DiscordUser Database Types (JetBrains)

/** Interface for the "DiscordUser"'s mongoose schema */
export interface DiscordUserBase {
  userId: string;
  username: string;
  avatarUrl?: string | null;
}

/** Interface for the "DiscordUser"'s mongoose document */
export interface DiscordUserDocument extends DiscordUserBase, Document {}

/** Interface for the "DiscordUser"'s mongoose model */
export interface DiscordUserModel extends Model<DiscordUserDocument> {
  findOneOrCreate(
    condition: FilterQuery<DiscordUserDocument>,
    doc: DiscordUserBase,
  ): Promise<DiscordUserDocument>;
}

// #endregion

/* ****************************** */
/*   Channel Database Types   */
/* ****************************** */

// #region Channel Database Types (VS Code)
// region Channel Database Types (JetBrains)

/** Interface for the "Channel"'s mongoose schema */
export interface SwanChannelBase {
  channelId: string;
  categoryId: string;
  name: string;
  logged: boolean;
}

/** Interface for the "Channel"'s mongoose document */
export interface SwanChannelDocument extends SwanChannelBase, Document {}

/** Interface for the "Channel"'s mongoose model */
export interface SwanChannelModel extends Model<SwanChannelDocument> {
  findOneOrCreate(
    condition: FilterQuery<SwanChannelDocument>,
    doc: SwanChannelBase,
  ): Promise<SwanChannelDocument>;
}

// #endregion

/* ****************************** */
/*   MessageLog Database Types   */
/* ****************************** */

// #region MessageLog Database Types (VS Code)
// region MessageLog Database Types (JetBrains)

/** Interface for the "MessageLog"'s mongoose schema */
export interface MessageLogBase {
  user: DiscordUserDocument;
  messageId: string;
  channelId: string;
  oldContent: string;
  editions: string[];
  newContent?: string | null;
}

/** Interface for the "MessageLog"'s mongoose document */
export interface MessageLogDocument extends MessageLogBase, Document {}

/** Interface for the "MessageLog"'s mongoose model */
export type MessageLogModel = Model<MessageLogDocument>;

// #endregion

import type {
  Collection,
  GuildAuditLogs,
  GuildAuditLogsEntry,
  GuildMember,
  Message,
  NewsChannel,
  Snowflake,
  TextChannel,
  User,
} from 'discord.js';
import type {
  Document,
  FilterQuery,
  Model,
  Types,
} from 'mongoose';
import type cron from 'node-cron';

// Represent an addon that matches the requirements, used in commands/addonInfo.ts
export interface MatchingAddon {
  file: string;
  name: string;
}

// Represent the object that is returned when calling the skripttools API, requesting
// informations for a specific addon.
export interface AddonResponse {
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

// Represent a Kick entry in the guild audit logs
export interface GuildKickAuditLogsEntry extends GuildAuditLogsEntry {
  action: 'MEMBER_KICK';
  target: User;
}

// Represent an audit log where all entries are Kick entries
export interface GuildKickAuditLogs extends GuildAuditLogs {
  entries: Collection<Snowflake, GuildKickAuditLogsEntry>;
}

// Represent the victim object of ModerationData#victim
export interface VictimInformations {
  id?: string;
  user?: User;
  member?: GuildMember;
}

// Extra sanctions informations in SanctionDocument#informations
export interface SanctionInformations {
  hasSentMessage?: boolean;
}

// The object returned by ModerationData#toSchema
export interface DataResult {
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

// A TextChannel which is in a guild
export type GuildTextBasedChannel = TextChannel | NewsChannel;

// Enforces that message.channel is a TextChannel or NewsChannel, not a DMChannel.
export type GuildMessage = { channel: GuildTextBasedChannel } & Message;

// TODO: Find a better way to do this. We can take inspiration from https://stackoverflow.com/a/55827534/11687747
// Better type the sanction types with 2 distincts types: creations and revokations.
// Sanctions types that *create* a new sanction
// export enum SanctionCreations {
//   Hardban = 'hardban',
//   Ban = 'ban',
//   Mute = 'mute',
//   Warn = 'warn',
//   Kick = 'kick',
// }

// Sanctions types that *revoke* a new sanction
// export enum SanctionRevokations {
//   Unban = 'unban',
//   Unmute = 'unmute',
//   RemoveWarn = 'removeWarn',
// }

// Different types of possible sanctions
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

// Types of sanction updates
export enum SanctionsUpdates {
  Revoked = 'revoked',
  Duration = 'duration',
}

// Interface for the "CommandStat"'s mongoose schema
export interface CommandStatBase {
  commandId: string;
  uses: number;
}

// Interface for the "CommandStat"'s mongoose document
export interface CommandStatDocument extends CommandStatBase, Document {}

// Interface for the "CommandStat"'s mongoose model
export type CommandStatModel = Model<CommandStatDocument>;

// Interface for the "ConvictedUser"'s mongoose schema
export interface ConvictedUserBase {
  memberId: string;
  lastBanId?: string;
  lastMuteId?: string;
  currentWarnCount?: number;
}

// Interface for the "ConvictedUser"'s mongoose document
export interface ConvictedUserDocument extends ConvictedUserBase, Document {}

// Interface for the "ConvictedUser"'s mongoose model
export interface ConvictedUserModel extends Model<ConvictedUserDocument> {
  findOneOrCreate(
    condition: FilterQuery<ConvictedUserDocument>,
    doc: ConvictedUserBase,
  ): Promise<ConvictedUserDocument>;
}

// Type of updates in SanctionDocument.updates
export interface SanctionUpdate {
  date: number;
  moderator: string;
  type: SanctionsUpdates;
  valueBefore?: number;
  valueAfter?: number;
  reason: string;
}

// Interface for the "Sanction"'s mongoose schema
export interface SanctionBase {
  memberId: string;
  user: Types.ObjectId | ConvictedUserDocument;
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

// Interface for the "Sanction"'s mongoose document.
// It is not meant to be used, it is just a base which extends document, and modify SanctionBase to use
// mongoose's types (allow things like .addToSet on the mongoose array)
interface SanctionBaseDocument extends SanctionBase, Document {
  updates?: Types.Array<SanctionUpdate>;
}

// Interface for the "Sanction"'s mongoose document, when the user field is not populated
export interface SanctionDocument extends SanctionBaseDocument {
  user: ConvictedUserDocument['_id'];
}

// Interface for the "Sanction"'s mongoose document, when the user field is populated
export interface SanctionPopulatedDocument extends SanctionBaseDocument {
  user: ConvictedUserDocument;
}

// Interface for the "Sanction"'s mongoose model
export type SanctionModel = Model<SanctionDocument>;

// Types of rules for where a command can be executed
export enum Rules {
  OnlyBotChannel,
  NoHelpChannel,
  OnlyHelpChannel,
}

// Informations associated to a task in the TaskHandler
export interface TaskInformations {
  interval?: NodeJS.Timeout;
  schedule?: cron.ScheduledTask;
}

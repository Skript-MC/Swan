import type { Message, NewsChannel, TextChannel } from 'discord.js';
import type { Document } from 'mongoose';

// A TextChannel which is in a guild
export type GuildTextBasedChannel = TextChannel | NewsChannel;

// Enforces that message.channel is a TextChannel or NewsChannel, not a DMChannel.
export type GuildMessage = { channel: GuildTextBasedChannel } & Message;

// Sanctions types that *create* a new sanction
export enum SanctionCreations {
  Hardban = 'hardban',
  Ban = 'ban',
  Mute = 'mute',
  Warn = 'warn',
  Kick = 'kick',
}

// Sanctions types that *revoke* a new sanction
export enum SanctionRevokations {
  Unban = 'unban',
  Unmute = 'unmute',
  RemoveWarn = 'removeWarn',
}

// TODO: Find a better way to do this. We can take inspiration from https://stackoverflow.com/a/55827534/11687747
// SanctionTypes is a merge of SanctionCreations and SanctionRevokations
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

// Document for the "CommandStat"'s mongoose collection
export interface CommandStatDocument extends Document {
  commandId: string;
  uses: number;
}

// Document for the "ConvictedUser"'s mongoose collection
export interface ConvictedUserDocument extends Document {
  memberId: string;
  lastBanId?: string;
  lastMuteId?: string;
  currentWarnCount: number;
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

// Document for the "Sanction"'s mongoose collection
export interface SanctionDocument extends Document {
  memberId: string;
  user: ConvictedUserDocument['_id'];
  type: SanctionCreations;
  moderator: string;
  start: number;
  duration?: number;
  finish?: number;
  reason: string;
  revoked: boolean;
  id: string;
  informations: {
    hasSentMessage: boolean;
  };
  updates: SanctionUpdate[];
}

// Types of rules for where a command can be executed
export enum Rules {
  OnlyBotChannel,
  NoHelpChannel,
  OnlyHelpChannel,
}

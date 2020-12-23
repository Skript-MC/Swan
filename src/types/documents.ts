import type { Document } from 'mongoose';
import type { SanctionsUpdates, SanctionCreations } from './sanctionsTypes';

export interface CommandStatDocument extends Document {
  commandId: string;
  uses: number;
}

export interface ConvictedUserDocument extends Document {
  memberId: string;
  lastBanId?: string;
  lastMuteId?: string;
  currentWarnCount: number;
}

export interface SanctionUpdate {
  date: number;
  moderator: string;
  type: SanctionsUpdates;
  valueBefore?: number;
  valueAfter?: number;
  reason: string;
}

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

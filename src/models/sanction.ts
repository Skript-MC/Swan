import { model, Schema } from 'mongoose';
import { nanoid } from 'nanoid';
import type { SanctionDocument, SanctionModel } from '#types/index';
import { SanctionsUpdates, SanctionTypes } from '#types/index';

const SanctionSchema = new Schema<SanctionDocument, SanctionModel>({
  userId: {
    type: String,
    required: true,
    index: true,
  },
  type: {
    type: String,
    required: true,
    enum: SanctionTypes,
  },
  moderator: {
    type: String,
    required: true,
  },
  start: {
    type: Number,
    required: true,
    default: Date.now(),
  },
  duration: {
    type: Number,
  },
  finish: {
    type: Number,
  },
  reason: {
    type: String,
    required: true,
  },
  revoked: {
    type: Boolean,
    required: true,
    default: false,
  },
  sanctionId: {
    type: String,
    required: true,
    default: (): string => nanoid(8),
    index: true,
  },
  updates: [{
    date: {
      type: Number,
      required: true,
      default: Date.now(),
    },
    moderator: {
      type: String,
      required: true,
    },
    type: {
      type: String,
      required: true,
      enum: SanctionsUpdates,
    },
    valueBefore: {
      type: Number,
    },
    valueAfter: {
      type: Number,
    },
    reason: {
      type: String,
      required: true,
    },
  }],
});

export const Sanction = model<SanctionDocument, SanctionModel>('Sanction', SanctionSchema);

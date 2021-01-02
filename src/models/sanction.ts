import { model, Schema } from 'mongoose';
import autopopulate from 'mongoose-autopopulate';
import { nanoid } from 'nanoid';
import { SanctionsUpdates, SanctionTypes } from '../types';
import type { SanctionDocument, SanctionModel } from '../types';

const SanctionSchema = new Schema({
  memberId: {
    type: String,
    required: true,
  },
  user: {
    type: Schema.Types.ObjectId,
    required: true,
    ref: 'ConvictedUser',
    autopopulate: true,
  },
  type: {
    type: String,
    required: true,
    enum: Object.values(SanctionTypes),
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
  },
  informations: {
    hasSentMessage: {
      type: Boolean,
    },
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
      enum: Object.values(SanctionsUpdates),
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

SanctionSchema.plugin(autopopulate);

export default model<SanctionDocument, SanctionModel>('Sanction', SanctionSchema);

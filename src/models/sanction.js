import { Schema, model } from 'mongoose';
import autopopulate from 'mongoose-autopopulate';
import { nanoid } from 'nanoid';
import { constants } from '../utils';

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
    enum: Object.values(constants.SANCTIONS.TYPES),
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
    required: true,
  },
  finish: {
    type: Number,
    required: true,
    default() { return this.start + this.duration; },
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
  id: {
    type: String,
    required: true,
    default: () => nanoid(8),
  },
  informations: {
    hasSentMessage: {
      type: Boolean,
      default: true,
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
      enum: Object.values(constants.SANCTIONS.UPDATES),
    },
    valueBefore: {
      type: Schema.Types.Mixed,
    },
    valueAfter: {
      type: Schema.Types.Mixed,
    },
    reason: {
      type: String,
      required: true,
    },
  }],
});

SanctionSchema.plugin(autopopulate);

export default model('Sanction', SanctionSchema);

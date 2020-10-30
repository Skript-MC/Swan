import { Schema, model } from 'mongoose';

const ConvictedUserSchema = new Schema({
  memberId: {
    type: String,
    required: true,
    unique: true,
  },
  lastBanId: {
    type: String,
    default: null,
  },
  lastMuteId: {
    type: String,
    default: null,
  },
  count: {
    type: Number,
    required: true,
    default: 0,
  },
  currentWarnCount: {
    type: Number,
    required: true,
    default: 0,
  },
});

export default model('ConvictedUser', ConvictedUserSchema);

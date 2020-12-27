import { Schema, model } from 'mongoose';
import type { Query } from 'mongoose';
import type { ConvictedUserDocument } from '../types';

const ConvictedUserSchema: Schema = new Schema({
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
  currentWarnCount: {
    type: Number,
    required: true,
    default: 0,
    min: 0,
  },
});

ConvictedUserSchema.statics.findOneOrCreate = async function (
  condition: Query<ConvictedUserDocument, ConvictedUserDocument>,
  doc: ConvictedUserDocument,
): Promise<ConvictedUserDocument> {
  const result = await this.findOne(condition);
  return result || this.create(doc);
};

export default model<ConvictedUserDocument>('ConvictedUser', ConvictedUserSchema);

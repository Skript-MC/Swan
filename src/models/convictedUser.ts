import { Schema, model } from 'mongoose';
import type { FilterQuery } from 'mongoose';
import type { ConvictedUserBase, ConvictedUserDocument, ConvictedUserModel } from '../types';

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
  currentWarnCount: {
    type: Number,
    default: 0,
    min: 0,
  },
});

ConvictedUserSchema.statics.findOneOrCreate = async function (
  this: ConvictedUserModel,
  condition: FilterQuery<ConvictedUserDocument>,
  doc: ConvictedUserBase,
): Promise<ConvictedUserDocument> {
  const result = await this.findOne(condition);
  return result || this.create(doc);
};

export default model<ConvictedUserDocument, ConvictedUserModel>('ConvictedUser', ConvictedUserSchema);

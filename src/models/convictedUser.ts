import type { FilterQuery } from 'mongoose';
import { model, Schema } from 'mongoose';
import type { ConvictedUserBase, ConvictedUserDocument, ConvictedUserModel } from '@/app/types';

const ConvictedUserSchema = new Schema<ConvictedUserDocument, ConvictedUserModel>({
  memberId: {
    type: String,
    required: true,
    unique: true,
    index: true,
  },
  currentBanId: {
    type: String,
    default: null,
  },
  currentMuteId: {
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
  return result ?? this.create(doc);
};

export default model<ConvictedUserDocument, ConvictedUserModel>('ConvictedUser', ConvictedUserSchema);

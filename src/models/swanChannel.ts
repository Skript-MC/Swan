import type { FilterQuery } from 'mongoose';
import { model, Schema } from 'mongoose';
import type { SwanChannelBase, SwanChannelDocument, SwanChannelModel } from '@/app/types';

const ChannelSchema = new Schema<SwanChannelDocument, SwanChannelModel>({
  channelId: {
    type: String,
    required: true,
    unique: true,
    index: true,
  },
  categoryId: {
    type: String,
    required: true,
  },
  name: {
    type: String,
    required: true,
  },
  logged: {
    type: Boolean,
    required: true,
    default: false,
  },
});

ChannelSchema.statics.findOneOrCreate = async function (
  this: SwanChannelModel,
  condition: FilterQuery<SwanChannelDocument>,
  doc: SwanChannelBase,
): Promise<SwanChannelDocument> {
  const result = await this.findOne(condition);
  return result ?? await this.create(doc);
};

export const SwanChannel = model<SwanChannelDocument, SwanChannelModel>('SwanChannel', ChannelSchema);

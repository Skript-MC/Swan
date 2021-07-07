import type { FilterQuery } from 'mongoose';
import { model, Schema } from 'mongoose';
import type { SharedConfigBase, SharedConfigDocument, SharedConfigModel } from '@/app/types';
import { SharedConfigName } from '@/app/types';

const SharedConfigSchema = new Schema<SharedConfigDocument, SharedConfigModel>({
  name: {
    type: String,
    required: true,
    enum: SharedConfigName,
    default: SharedConfigName.LoggedChannels,
    unique: true,
    index: true,
  },
  value: {
    type: Schema.Types.Mixed,
    required: true,
  },
});

SharedConfigSchema.statics.findOneOrCreate = async function (
  this: SharedConfigModel,
  condition: FilterQuery<SharedConfigDocument>,
  doc: SharedConfigBase,
): Promise<SharedConfigDocument> {
  const result = await this.findOne(condition);
  return result ?? this.create(doc);
};

export default model<SharedConfigDocument, SharedConfigModel>('SharedConfig', SharedConfigSchema);

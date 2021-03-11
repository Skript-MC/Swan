import { model, Schema } from 'mongoose';
import type { SharedConfigDocument, SharedConfigModel } from '@/app/types';

const SharedConfigSchema = new Schema<SharedConfigDocument, SharedConfigModel>({
  name: {
    type: String,
    required: true,
    unique: true,
  },
  value: {
    type: Schema.Types.Mixed,
    required: true,
  },
});

export default model<SharedConfigDocument, SharedConfigModel>('SharedConfig', SharedConfigSchema);

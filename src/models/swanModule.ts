import { model, Schema } from 'mongoose';
import type { SwanModuleDocument, SwanModuleModel } from '@/app/types';

const SwanModuleSchema = new Schema({
  name: {
    type: String,
    required: true,
  },
  handler: {
    type: String,
    enum: ['commandHandler', 'inhibitorHandler', 'listenerHandler', 'taskHandler'],
    required: true,
  },
  enabled: {
    type: Boolean,
    default: true,
  },
});

export default model<SwanModuleDocument, SwanModuleModel>('SwanModule', SwanModuleSchema);

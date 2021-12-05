import { model, Schema } from 'mongoose';
import type { SwanModuleDocument, SwanModuleModel } from '@/app/types';

const SwanModuleSchema = new Schema({
  name: {
    type: String,
    required: true,
  },
  store: {
    type: String,
    enum: ['commands', 'preconditions', 'tasks', 'listeners'],
    required: true,
  },
  location: new Schema({
    relative: {
      type: String,
      required: true,
    },
    root: {
      type: String,
      required: true,
    },
  }),
  enabled: {
    type: Boolean,
    default: true,
  },
});

export default model<SwanModuleDocument, SwanModuleModel>('SwanModule', SwanModuleSchema);

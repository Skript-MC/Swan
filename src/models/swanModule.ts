import { Schema, model } from 'mongoose';
import type { SwanModuleDocument, SwanModuleModel } from '#types/index';

export const allowedStores = [
  'commands',
  'preconditions',
  'tasks',
  'listeners',
  'interaction-handlers',
];

const SwanModuleSchema = new Schema<SwanModuleDocument, SwanModuleModel>({
  name: {
    type: String,
    required: true,
  },
  store: {
    type: String,
    enum: allowedStores,
    required: true,
  },
  location: new Schema({
    full: {
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

export const SwanModule = model<SwanModuleDocument, SwanModuleModel>(
  'SwanModule',
  SwanModuleSchema,
);

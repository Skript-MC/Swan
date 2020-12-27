import { Schema, model } from 'mongoose';
import type { CommandStatDocument } from '../types';

const CommandStatSchema: Schema = new Schema({
  commandId: {
    type: String,
    required: true,
  },
  uses: {
    type: Number,
    default: 0,
  },
});

export default model<CommandStatDocument>('CommandStat', CommandStatSchema);

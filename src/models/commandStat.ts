import { model, Schema } from 'mongoose';
import type { CommandStatDocument, CommandStatModel } from '../types';

const CommandStatSchema = new Schema({
  commandId: {
    type: String,
    required: true,
  },
  uses: {
    type: Number,
    default: 0,
  },
});

export default model<CommandStatDocument, CommandStatModel>('CommandStat', CommandStatSchema);

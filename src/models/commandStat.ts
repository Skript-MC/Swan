import { model, Schema } from 'mongoose';
import type { CommandStatDocument, CommandStatModel } from '@/app/types';

const CommandStatSchema = new Schema<CommandStatDocument, CommandStatModel>({
  commandId: {
    type: String,
    required: true,
    unique: true,
    index: true,
  },
  uses: {
    type: Number,
    default: 0,
  },
});

export const CommandStat = model<CommandStatDocument, CommandStatModel>('CommandStat', CommandStatSchema);

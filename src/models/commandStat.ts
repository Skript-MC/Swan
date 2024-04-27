import { Schema, model } from 'mongoose';
import type { CommandStatDocument, CommandStatModel } from '#types/index';

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

export const CommandStat = model<CommandStatDocument, CommandStatModel>(
  'CommandStat',
  CommandStatSchema,
);

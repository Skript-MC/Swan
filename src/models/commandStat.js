import { Schema, model } from 'mongoose';

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

export default model('CommandStat', CommandStatSchema);

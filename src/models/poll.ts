import { model, Schema } from 'mongoose';
import type { PollDocument, PollModel } from '@/app/types';

const PollSchema = new Schema({
  messageId: {
    type: String,
    required: true,
    index: true,
  },
  memberId: {
    type: String,
    required: true,
  },
  channelId: {
    type: String,
    required: true,
  },
  finish: {
    type: Number,
    required: true,
  },
  duration: {
    type: Number,
    required: true,
  },
  questionType: {
    type: Number,
    required: true,
    enum: [0, 1],
  },
  votes: {},
  question: {
    type: String,
    required: true,
  },
  customAnswers: [String],
  anonymous: {
    type: Boolean,
    default: false,
  },
  multiple: {
    type: Boolean,
    default: false,
  },
});

export default model<PollDocument, PollModel>('Poll', PollSchema);

import { model, Schema } from 'mongoose';
import type { MessageLogDocument, MessageLogModel } from '@/app/types';

const MessageLogSchema = new Schema<MessageLogDocument, MessageLogModel>({
  userId: {
    type: String,
    required: true,
  },
  messageId: {
    type: String,
    required: true,
    index: true,
  },
  channelId: {
    type: String,
    required: true,
  },
  oldContent: {
    type: String,
    required: true,
  },
  editions: {
    type: [String],
    required: true,
    default: [],
  },
  newContent: {
    type: String,
    default: null,
  },
});

export default model<MessageLogDocument, MessageLogModel>('MessageLog', MessageLogSchema);

import { model, Schema } from 'mongoose';
import type { MessageLogDocument, MessageLogModel } from '@/app/types';

const MessageLogSchema = new Schema<MessageLogDocument, MessageLogModel>({
  user: {
    type: Schema.Types.ObjectId,
    required: true,
    ref: 'DiscordUser',
    autopopulate: true,
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

export const MessageLog = model<MessageLogDocument, MessageLogModel>('MessageLog', MessageLogSchema);

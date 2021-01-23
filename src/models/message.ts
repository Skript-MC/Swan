import { model, Schema } from 'mongoose';
import type { MessageDocument, MessageModel } from '@/app/types';

const MessageSchema = new Schema({
  messageType: {
    type: String,
    required: true,
  },
  name: {
    type: String,
    required: true,
  },
  aliases: {
    type: [String],
    required: true,
  },
  content: {
    type: String,
    required: true,
  },
});

export default model<MessageDocument, MessageModel>('Message', MessageSchema);

import { model, Schema } from 'mongoose';
import type { MessageDocument, MessageModel } from '@/app/types';
import { MessageName } from '@/app/types';

const MessageSchema = new Schema<MessageDocument, MessageModel>({
  messageType: {
    type: String,
    enum: MessageName,
    default: MessageName.AddonPack,
    required: true,
    index: true,
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

export const Message = model<MessageDocument, MessageModel>('Message', MessageSchema);

import { Schema, model } from 'mongoose';
import type { MessageDocument, MessageModel } from '#types/index';
import { MessageName } from '#types/index';

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

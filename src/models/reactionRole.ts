import { model, Schema } from 'mongoose';
import type { ReactionRoleDocument, ReactionRoleModel } from '#types/index';

const ReactionRoleSchema = new Schema<ReactionRoleDocument, ReactionRoleModel>({
  messageId: {
    type: String,
    required: true,
    index: true,
  },
  channelId: {
    type: String,
    required: true,
  },
  givenRoleId: {
    type: String,
    required: true,
  },
  reaction: {
    type: String,
    required: false,
  },
});

export const ReactionRole = model<ReactionRoleDocument, ReactionRoleModel>('ReactionRole', ReactionRoleSchema);

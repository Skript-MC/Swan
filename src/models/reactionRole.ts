import { model, Schema } from 'mongoose';
import type { ReactionRoleDocument, ReactionRoleModel } from '../types';

const ReactionRoleSchema = new Schema({
    messageId: {
        type: String,
        required: true,
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
    permissionRoleId: {
        type: String,
        required: false,
    },
});

export default model<ReactionRoleDocument, ReactionRoleModel>('ReactionRole', ReactionRoleSchema);

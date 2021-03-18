import type { FilterQuery } from 'mongoose';
import { model, Schema } from 'mongoose';
import type { DiscordUserBase, DiscordUserDocument, DiscordUserModel } from '@/app/types';

const DiscordUserSchema = new Schema<DiscordUserDocument, DiscordUserModel>({
  userId: {
    type: String,
    required: true,
    unique: true,
  },
  username: {
    type: String,
    required: true,
  },
  avatarUrl: {
    type: String,
  },
});

DiscordUserSchema.statics.findOneOrCreate = async function (
  this: DiscordUserModel,
  condition: FilterQuery<DiscordUserDocument>,
  doc: DiscordUserBase,
): Promise<DiscordUserDocument> {
  const result = await this.findOne(condition);
  return result || this.create(doc);
};

export default model<DiscordUserDocument, DiscordUserModel>('DiscordUser', DiscordUserSchema);

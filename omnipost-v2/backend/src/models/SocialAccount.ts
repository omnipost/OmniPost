import mongoose, { model, Schema } from 'mongoose';

export interface ISocialAccount {
  _id: string;
  platform: string;
  refresh_token_enc: string;
  access_token_enc: string;
  token_expires_at?: Date;
  status: string;
  created_at: Date;
  updated_at: Date;
}

export type ISocialAccountDocument = mongoose.Document<unknown, unknown, ISocialAccount> & ISocialAccount;

const socialAccountSchema = new Schema(
  {
    _id: { type: String, required: true },
    platform: { type: String, required: true, trim: true },
    refresh_token_enc: { type: String, required: true },
    access_token_enc: { type: String, required: true },
    token_expires_at: { type: Date },
    status: { type: String, required: true, default: 'connected' },
    created_at: { type: Date, required: true, default: () => new Date() },
    updated_at: { type: Date, required: true, default: () => new Date() },
  },
  {
    versionKey: false,
  }
);

const SocialAccount = mongoose.models.SocialAccount || model<ISocialAccountDocument>('SocialAccount', socialAccountSchema as Schema);

export default SocialAccount;

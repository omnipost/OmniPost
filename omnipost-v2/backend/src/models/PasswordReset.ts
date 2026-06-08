import mongoose, { Document, model, Schema } from 'mongoose';

export interface IPasswordReset {
  email: string;
  codeHash: string;
  expiresAt: Date;
  createdAt: Date;
}

export interface IPasswordResetDocument extends IPasswordReset, Document {}

const passwordResetSchema = new Schema<IPasswordResetDocument>(
  {
    email: { type: String, required: true, trim: true, lowercase: true, unique: true, index: true },
    codeHash: { type: String, required: true },
    expiresAt: { type: Date, required: true, index: true },
    createdAt: { type: Date, required: true, default: () => new Date() },
  },
  {
    versionKey: false,
  }
);

passwordResetSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });

const PasswordReset = mongoose.models.PasswordReset || model<IPasswordResetDocument>('PasswordReset', passwordResetSchema);

export default PasswordReset;

import mongoose, { Document, model, Schema } from 'mongoose';

export interface IUser {
  name: string;
  email: string;
  mobile?: string;
  passwordHash: string;
  plan: string;
  isVerified: boolean;
  createdAt: Date;
}

export interface IUserDocument extends IUser, Document {}

const userSchema = new Schema<IUserDocument>(
  {
    name: { type: String, required: true, trim: true },
    email: { type: String, required: true, trim: true, lowercase: true, unique: true, index: true },
    mobile: { type: String, trim: true, unique: true, sparse: true, index: true },
    passwordHash: { type: String, required: true },
    plan: { type: String, required: true, default: 'free' },
    isVerified: { type: Boolean, required: true, default: false },
    createdAt: { type: Date, required: true, default: () => new Date() },
  },
  {
    versionKey: false,
  }
);

const User = mongoose.models.User || model<IUserDocument>('User', userSchema);

export default User;

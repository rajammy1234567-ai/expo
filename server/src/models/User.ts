import mongoose, { Schema, Document } from 'mongoose';

export interface IUser extends Document {
  name: string;
  email: string;
  phone: string;
  isPhoneVerified: boolean;
  isEmailVerified: boolean;
  avatarUrl?: string;
  role: 'INVESTOR' | 'BRAND_ADMIN' | 'BRAND_MEMBER' | 'VIZ_ADMIN' | 'VIZ_SUPERADMIN';
  status: 'ACTIVE' | 'PENDING_VERIFICATION' | 'SUSPENDED';
  authProvider: 'PHONE_OTP' | 'GOOGLE' | 'EMAIL_PASSWORD';
  passwordHash?: string;
  otpCode?: string;
  otpExpiresAt?: Date;
  investorProfileId?: mongoose.Types.ObjectId;
  brandId?: mongoose.Types.ObjectId;
  fcmTokens: string[];
  createdAt: Date;
  updatedAt: Date;
}

const UserSchema = new Schema<IUser>(
  {
    name: { type: String, required: true, trim: true },
    email: { type: String, required: true, unique: true, lowercase: true, trim: true },
    phone: { type: String, required: true, unique: true, trim: true },
    isPhoneVerified: { type: Boolean, default: false },
    isEmailVerified: { type: Boolean, default: false },
    avatarUrl: { type: String, default: '' },
    role: {
      type: String,
      enum: ['INVESTOR', 'BRAND_ADMIN', 'BRAND_MEMBER', 'VIZ_ADMIN', 'VIZ_SUPERADMIN'],
      default: 'INVESTOR',
    },
    status: {
      type: String,
      enum: ['ACTIVE', 'PENDING_VERIFICATION', 'SUSPENDED'],
      default: 'ACTIVE',
    },
    authProvider: {
      type: String,
      enum: ['PHONE_OTP', 'GOOGLE', 'EMAIL_PASSWORD'],
      default: 'EMAIL_PASSWORD',
    },
    passwordHash: { type: String },
    otpCode: { type: String },
    otpExpiresAt: { type: Date },
    investorProfileId: { type: Schema.Types.ObjectId, ref: 'InvestorProfile' },
    brandId: { type: Schema.Types.ObjectId, ref: 'Brand' },
    fcmTokens: [{ type: String }],
  },
  { timestamps: true }
);

export const User = mongoose.model<IUser>('User', UserSchema);

import mongoose, { Schema, Document } from 'mongoose';

export interface IInvestorProfile extends Document {
  userId: mongoose.Types.ObjectId;
  city: string;
  state: string;
  tier: 'TIER_1' | 'TIER_2' | 'TIER_3';
  investmentBudget: {
    minINR: number;
    maxINR: number;
    bracket: 'UNDER_5L' | '5L_10L' | '10L_25L' | '25L_50L' | '50L_1CR' | '1CR_PLUS';
  };
  preferredCategories: string[]; // ['Food', 'Education', 'Retail', 'Fitness', 'Beauty', 'Healthcare', 'EV', 'Technology']
  franchiseModelPreference: ('FOFO' | 'FOCO' | 'COCO' | 'COFO')[];
  businessExperienceYears: number;
  availableCommercialSpaceSqFt?: number;
  hasOwnProperty: boolean;
  expectedPaybackMonths?: number;
  savedBrandIds: mongoose.Types.ObjectId[];
  subscription: {
    plan: 'FREE' | 'STARTER' | 'GROWTH' | 'PREMIUM';
    expiresAt?: Date;
    directMeetingCreditsRemaining: number;
    aiQueryCreditsRemaining: number;
  };
  createdAt: Date;
  updatedAt: Date;
}

const InvestorProfileSchema = new Schema<IInvestorProfile>(
  {
    userId: { type: Schema.Types.ObjectId, ref: 'User', required: true, unique: true },
    city: { type: String, required: true, default: 'Chandigarh' },
    state: { type: String, default: 'Punjab' },
    tier: { type: String, enum: ['TIER_1', 'TIER_2', 'TIER_3'], default: 'TIER_2' },
    investmentBudget: {
      minINR: { type: Number, default: 2500000 },
      maxINR: { type: Number, default: 5000000 },
      bracket: {
        type: String,
        enum: ['UNDER_5L', '5L_10L', '10L_25L', '25L_50L', '50L_1CR', '1CR_PLUS'],
        default: '25L_50L',
      },
    },
    preferredCategories: {
      type: [String],
      default: ['Food', 'Retail'],
    },
    franchiseModelPreference: {
      type: [String],
      enum: ['FOFO', 'FOCO', 'COCO', 'COFO'],
      default: ['FOFO'],
    },
    businessExperienceYears: { type: Number, default: 3 },
    availableCommercialSpaceSqFt: { type: Number, default: 1000 },
    hasOwnProperty: { type: Boolean, default: false },
    expectedPaybackMonths: { type: Number, default: 24 },
    savedBrandIds: [{ type: Schema.Types.ObjectId, ref: 'Brand' }],
    subscription: {
      plan: {
        type: String,
        enum: ['FREE', 'STARTER', 'GROWTH', 'PREMIUM'],
        default: 'FREE',
      },
      expiresAt: { type: Date },
      directMeetingCreditsRemaining: { type: Number, default: 5 },
      aiQueryCreditsRemaining: { type: Number, default: 50 },
    },
  },
  { timestamps: true }
);

export const InvestorProfile = mongoose.model<IInvestorProfile>('InvestorProfile', InvestorProfileSchema);

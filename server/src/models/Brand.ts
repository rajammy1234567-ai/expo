import mongoose, { Schema, Document } from 'mongoose';

export interface IBrand extends Document {
  slug: string;
  brandName: string;
  tagline: string;
  description: string;
  category: string; // Food, Education, Retail, Fitness, Beauty, Healthcare, EV, Technology
  subCategories: string[];
  logoUrl: string;
  bannerUrl: string;
  pitchVideoUrl: string;
  galleryUrls: string[];
  brochurePdfUrl: string;

  verificationStatus: 'PENDING' | 'UNDER_REVIEW' | 'VERIFIED' | 'REJECTED';
  verifiedAt?: Date;
  isFeatured: boolean;
  featuredRank: number;

  investmentRange: {
    minINR: number;
    maxINR: number;
    displayString: string;
  };
  franchiseFeeINR: number;
  royaltyPercentage: number;
  requiredAreaSqFt: {
    min: number;
    max: number;
    displayString: string;
  };
  businessModel: 'FOFO' | 'FOCO' | 'COCO' | 'COFO';
  estimatedROIHistoricalMonths: {
    min: number;
    max: number;
    disclaimer: string;
  };
  targetExpansionCities: string[];
  existingOutletsCount: number;
  yearEstablished: number;

  supportOffered: {
    siteSelection: boolean;
    staffTraining: boolean;
    marketingSupport: boolean;
    interiorSetup: boolean;
    rawMaterialSupply: boolean;
    softwareBillingPOS: boolean;
  };

  subscription: {
    tier: 'BASIC' | 'FEATURED' | 'PREMIUM_BOOTH' | 'ENTERPRISE';
    startDate: Date;
    expiresAt: Date;
    agreedSuccessFeePercentage: number; // 3%
    isActive: boolean;
  };

  aiBotSettings: {
    isEnabled: boolean;
    botName: string;
    welcomeMessage: string;
  };

  createdAt: Date;
  updatedAt: Date;
}

const BrandSchema = new Schema<IBrand>(
  {
    slug: { type: String, required: true, unique: true, lowercase: true, trim: true },
    brandName: { type: String, required: true, trim: true },
    tagline: { type: String, default: '' },
    description: { type: String, required: true },
    category: { type: String, required: true },
    subCategories: [{ type: String }],
    logoUrl: { type: String, required: true },
    bannerUrl: { type: String, default: '' },
    pitchVideoUrl: { type: String, default: '' },
    galleryUrls: [{ type: String }],
    brochurePdfUrl: { type: String, default: '' },

    verificationStatus: {
      type: String,
      enum: ['PENDING', 'UNDER_REVIEW', 'VERIFIED', 'REJECTED'],
      default: 'VERIFIED',
    },
    verifiedAt: { type: Date },
    isFeatured: { type: Boolean, default: false },
    featuredRank: { type: Number, default: 0 },

    investmentRange: {
      minINR: { type: Number, required: true },
      maxINR: { type: Number, required: true },
      displayString: { type: String, required: true },
    },
    franchiseFeeINR: { type: Number, default: 500000 },
    royaltyPercentage: { type: Number, default: 5 },
    requiredAreaSqFt: {
      min: { type: Number, required: true },
      max: { type: Number, required: true },
      displayString: { type: String, required: true },
    },
    businessModel: {
      type: String,
      enum: ['FOFO', 'FOCO', 'COCO', 'COFO'],
      default: 'FOFO',
    },
    estimatedROIHistoricalMonths: {
      min: { type: Number, default: 12 },
      max: { type: Number, default: 18 },
      disclaimer: {
        type: String,
        default:
          'Based on historical estimates provided by brand. Actual results depend on location and management.',
      },
    },
    targetExpansionCities: [{ type: String }],
    existingOutletsCount: { type: Number, default: 10 },
    yearEstablished: { type: Number, default: 2018 },

    supportOffered: {
      siteSelection: { type: Boolean, default: true },
      staffTraining: { type: Boolean, default: true },
      marketingSupport: { type: Boolean, default: true },
      interiorSetup: { type: Boolean, default: true },
      rawMaterialSupply: { type: Boolean, default: true },
      softwareBillingPOS: { type: Boolean, default: true },
    },

    subscription: {
      tier: {
        type: String,
        enum: ['BASIC', 'FEATURED', 'PREMIUM_BOOTH', 'ENTERPRISE'],
        default: 'FEATURED',
      },
      startDate: { type: Date, default: Date.now },
      expiresAt: { type: Date, default: () => new Date(Date.now() + 365 * 24 * 60 * 60 * 1000) },
      agreedSuccessFeePercentage: { type: Number, default: 3.0 },
      isActive: { type: Boolean, default: true },
    },

    aiBotSettings: {
      isEnabled: { type: Boolean, default: true },
      botName: { type: String, default: 'Brand AI Assistant' },
      welcomeMessage: {
        type: String,
        default: 'Hello! I am the official AI assistant for this brand. Ask me about investment, formats, or unit economics!',
      },
    },
  },
  { timestamps: true }
);

export const Brand = mongoose.model<IBrand>('Brand', BrandSchema);

import mongoose, { Schema, Document } from 'mongoose';

export interface ILead extends Document {
  investorId: mongoose.Types.ObjectId;
  investorProfileId?: mongoose.Types.ObjectId;
  brandId: mongoose.Types.ObjectId;
  source: 'BOOTH_DISCOVERY' | 'AI_CHAT' | 'DIRECT_MEETING_REQUEST' | 'BROCHURE_DOWNLOAD';
  status:
    | 'NEW'
    | 'CONTACTED'
    | 'MEETING_SCHEDULED'
    | 'MEETING_COMPLETED'
    | 'NEGOTIATION'
    | 'DUE_DILIGENCE'
    | 'AGREEMENT_SIGNED'
    | 'CLOSED_WON'
    | 'CLOSED_LOST';
  investorSnapshot: {
    name: string;
    phone: string;
    email: string;
    city: string;
    budgetBracket: string;
    experienceYears: number;
  };
  brandInternalNotes: string[];
  dealValueEstimatedINR?: number;
  closedDealValueINR?: number;
  stageHistory: {
    stage: string;
    updatedAt: Date;
    note?: string;
  }[];
  createdAt: Date;
  updatedAt: Date;
}

const LeadSchema = new Schema<ILead>(
  {
    investorId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    investorProfileId: { type: Schema.Types.ObjectId, ref: 'InvestorProfile' },
    brandId: { type: Schema.Types.ObjectId, ref: 'Brand', required: true },
    source: {
      type: String,
      enum: ['BOOTH_DISCOVERY', 'AI_CHAT', 'DIRECT_MEETING_REQUEST', 'BROCHURE_DOWNLOAD'],
      default: 'BOOTH_DISCOVERY',
    },
    status: {
      type: String,
      enum: [
        'NEW',
        'CONTACTED',
        'MEETING_SCHEDULED',
        'MEETING_COMPLETED',
        'NEGOTIATION',
        'DUE_DILIGENCE',
        'AGREEMENT_SIGNED',
        'CLOSED_WON',
        'CLOSED_LOST',
      ],
      default: 'NEW',
    },
    investorSnapshot: {
      name: { type: String, required: true },
      phone: { type: String, required: true },
      email: { type: String, required: true },
      city: { type: String, required: true },
      budgetBracket: { type: String, default: '₹25L – ₹50L' },
      experienceYears: { type: Number, default: 2 },
    },
    brandInternalNotes: [{ type: String }],
    dealValueEstimatedINR: { type: Number, default: 3000000 },
    closedDealValueINR: { type: Number },
    stageHistory: [
      {
        stage: { type: String, required: true },
        updatedAt: { type: Date, default: Date.now },
        note: { type: String },
      },
    ],
  },
  { timestamps: true }
);

export const Lead = mongoose.model<ILead>('Lead', LeadSchema);

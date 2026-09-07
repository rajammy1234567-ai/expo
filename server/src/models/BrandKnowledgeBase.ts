import mongoose, { Schema, Document } from 'mongoose';

export interface IBrandKnowledgeBase extends Document {
  brandId: mongoose.Types.ObjectId;
  sourceType: 'DOCUMENT_PDF' | 'FAQ_MANUAL' | 'FINANCIAL_BREAKUP' | 'EXPANSION_RULES';
  title: string;
  question?: string;
  answer?: string;
  content: string;
  isApprovedByBrand: boolean;
  isApprovedByAdmin: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const BrandKnowledgeBaseSchema = new Schema<IBrandKnowledgeBase>(
  {
    brandId: { type: Schema.Types.ObjectId, ref: 'Brand', required: true },
    sourceType: {
      type: String,
      enum: ['DOCUMENT_PDF', 'FAQ_MANUAL', 'FINANCIAL_BREAKUP', 'EXPANSION_RULES'],
      default: 'FAQ_MANUAL',
    },
    title: { type: String, required: true },
    question: { type: String },
    answer: { type: String },
    content: { type: String, required: true },
    isApprovedByBrand: { type: Boolean, default: true },
    isApprovedByAdmin: { type: Boolean, default: true },
  },
  { timestamps: true }
);

export const BrandKnowledgeBase = mongoose.model<IBrandKnowledgeBase>(
  'BrandKnowledgeBase',
  BrandKnowledgeBaseSchema
);

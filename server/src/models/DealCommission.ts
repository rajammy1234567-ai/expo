import mongoose, { Schema, Document } from 'mongoose';

export interface IDealCommission extends Document {
  dealNumber: string; // e.g. "VIZ-DEAL-2026-0042"
  leadId?: mongoose.Types.ObjectId;
  brandId: mongoose.Types.ObjectId;
  investorId: mongoose.Types.ObjectId;
  franchiseCity: string;
  franchiseUnitModel: 'FOFO' | 'FOCO' | 'COCO' | 'COFO';

  totalDealValueINR: number; // e.g. ₹30,00,000
  commissionRatePercentage: number; // 3.0%
  calculatedCommissionINR: number; // ₹90,000
  taxINR: number; // 18% GST = ₹16,200
  totalInvoiceAmountINR: number; // ₹1,06,200

  status: 'PENDING_VERIFICATION' | 'INVOICED' | 'PARTIALLY_PAID' | 'RECEIVED_SETTLED' | 'DISPUTED';
  invoiceNumber?: string;
  proofOfAgreementUrl?: string;
  paymentReferenceNo?: string;
  settledAt?: Date;
  brandNotes?: string;
  adminNotes?: string;
  createdAt: Date;
  updatedAt: Date;
}

const DealCommissionSchema = new Schema<IDealCommission>(
  {
    dealNumber: { type: String, required: true, unique: true },
    leadId: { type: Schema.Types.ObjectId, ref: 'Lead' },
    brandId: { type: Schema.Types.ObjectId, ref: 'Brand', required: true },
    investorId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    franchiseCity: { type: String, required: true },
    franchiseUnitModel: {
      type: String,
      enum: ['FOFO', 'FOCO', 'COCO', 'COFO'],
      default: 'FOFO',
    },
    totalDealValueINR: { type: Number, required: true },
    commissionRatePercentage: { type: Number, default: 3.0 },
    calculatedCommissionINR: { type: Number, required: true },
    taxINR: { type: Number, default: 0 },
    totalInvoiceAmountINR: { type: Number, required: true },
    status: {
      type: String,
      enum: ['PENDING_VERIFICATION', 'INVOICED', 'PARTIALLY_PAID', 'RECEIVED_SETTLED', 'DISPUTED'],
      default: 'PENDING_VERIFICATION',
    },
    invoiceNumber: { type: String },
    proofOfAgreementUrl: { type: String },
    paymentReferenceNo: { type: String },
    settledAt: { type: Date },
    brandNotes: { type: String },
    adminNotes: { type: String },
  },
  { timestamps: true }
);

export const DealCommission = mongoose.model<IDealCommission>('DealCommission', DealCommissionSchema);

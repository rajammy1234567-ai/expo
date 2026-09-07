import { DealCommission, IDealCommission } from '../models/DealCommission';
import mongoose from 'mongoose';

export class CommissionService {
  /**
   * Calculates commission and GST for a closed deal.
   */
  static calculateDealCommission(dealValueINR: number, commissionRatePercentage = 3.0) {
    const calculatedCommissionINR = (dealValueINR * commissionRatePercentage) / 100;
    const taxINR = (calculatedCommissionINR * 18) / 100; // 18% GST
    const totalInvoiceAmountINR = calculatedCommissionINR + taxINR;

    return {
      dealValueINR,
      commissionRatePercentage,
      calculatedCommissionINR,
      taxINR,
      totalInvoiceAmountINR,
    };
  }

  /**
   * Creates a formal Deal Commission record in the database.
   */
  static async recordClosedDeal(data: {
    brandId: string;
    investorId: string;
    leadId?: string;
    franchiseCity: string;
    franchiseUnitModel: 'FOFO' | 'FOCO' | 'COCO' | 'COFO';
    totalDealValueINR: number;
    commissionRatePercentage?: number;
    brandNotes?: string;
  }): Promise<IDealCommission> {
    const rate = data.commissionRatePercentage || 3.0;
    const financials = this.calculateDealCommission(data.totalDealValueINR, rate);
    const count = await DealCommission.countDocuments();
    const dealNumber = `VIZ-DEAL-2026-${String(count + 1).padStart(4, '0')}`;
    const invoiceNumber = `VIZ-INV-2026-${String(count + 1).padStart(4, '0')}`;

    const newDeal = new DealCommission({
      dealNumber,
      brandId: new mongoose.Types.ObjectId(data.brandId),
      investorId: new mongoose.Types.ObjectId(data.investorId),
      leadId: data.leadId ? new mongoose.Types.ObjectId(data.leadId) : undefined,
      franchiseCity: data.franchiseCity,
      franchiseUnitModel: data.franchiseUnitModel,
      totalDealValueINR: financials.dealValueINR,
      commissionRatePercentage: financials.commissionRatePercentage,
      calculatedCommissionINR: financials.calculatedCommissionINR,
      taxINR: financials.taxINR,
      totalInvoiceAmountINR: financials.totalInvoiceAmountINR,
      status: 'PENDING_VERIFICATION',
      invoiceNumber,
      brandNotes: data.brandNotes,
    });

    return await newDeal.save();
  }
}

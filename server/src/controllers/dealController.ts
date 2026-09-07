import { Response } from 'express';
import { inMemoryStore } from '../store/inMemoryStore';
import { CommissionService } from '../services/commissionService';

export class DealController {
  static async recordDeal(req: any, res: Response) {
    const {
      brandId,
      investorId,
      leadId,
      franchiseCity,
      franchiseUnitModel = 'FOFO',
      totalDealValueINR,
      commissionRatePercentage = 3.0,
      brandNotes,
    } = req.body;

    const brand = inMemoryStore.brands.find((b) => b._id === brandId) || inMemoryStore.brands[0] || null;
    const user = inMemoryStore.users.find((u) => u._id === investorId) || inMemoryStore.users[0] || { name: 'Investor User', phone: '', email: '' };
    const financials = CommissionService.calculateDealCommission(Number(totalDealValueINR) || 3000000, Number(commissionRatePercentage) || 3.0);

    const count = inMemoryStore.deals.length + 1;
    const deal = {
      _id: `65e5000000000000000000${count + 10}`,
      dealNumber: `VIZ-DEAL-2026-${String(count).padStart(4, '0')}`,
      brandId: brand,
      investorId: user,
      leadId,
      franchiseCity: franchiseCity || 'Chandigarh',
      franchiseUnitModel,
      totalDealValueINR: financials.dealValueINR,
      commissionRatePercentage: financials.commissionRatePercentage,
      calculatedCommissionINR: financials.calculatedCommissionINR,
      taxINR: financials.taxINR,
      totalInvoiceAmountINR: financials.totalInvoiceAmountINR,
      status: 'PENDING_VERIFICATION',
      invoiceNumber: `VIZ-INV-2026-${String(count).padStart(4, '0')}`,
      brandNotes,
      createdAt: new Date().toISOString(),
    };

    inMemoryStore.deals.unshift(deal);

    return res.json({
      success: true,
      message: 'Deal recorded successfully! VIZ 3% commission invoice logged.',
      deal,
    });
  }

  static async getBrandDeals(req: any, res: Response) {
    const { brandId } = req.params;
    const deals = inMemoryStore.deals.filter((d) => d.brandId?._id === brandId || d.brandId === brandId);

    const totalDealVolumeINR = deals.reduce((acc, d) => acc + d.totalDealValueINR, 0);
    const totalCommissionDueINR = deals.reduce((acc, d) => acc + d.calculatedCommissionINR, 0);

    return res.json({
      success: true,
      stats: {
        totalDeals: deals.length,
        totalDealVolumeINR,
        totalCommissionDueINR,
      },
      deals,
    });
  }
}

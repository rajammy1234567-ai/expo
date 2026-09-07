import { Response } from 'express';
import { inMemoryStore } from '../store/inMemoryStore';

export class AdminController {
  static async getAdminOverview(req: any, res: Response) {
    const deals = inMemoryStore.deals;
    const totalDealVolumeINR = deals.reduce((acc, d) => acc + d.totalDealValueINR, 0);
    const totalCommissionEarnedINR = deals.reduce((acc, d) => acc + d.calculatedCommissionINR, 0);
    const settledCommissionINR = deals
      .filter((d) => d.status === 'RECEIVED_SETTLED')
      .reduce((acc, d) => acc + d.calculatedCommissionINR, 0);
    const pendingCommissionINR = deals
      .filter((d) => d.status !== 'RECEIVED_SETTLED')
      .reduce((acc, d) => acc + d.calculatedCommissionINR, 0);

    return res.json({
      success: true,
      stats: {
        totalBrands: inMemoryStore.brands.length,
        verifiedBrands: inMemoryStore.brands.filter((b) => b.verificationStatus === 'VERIFIED').length,
        pendingBrands: inMemoryStore.brands.filter((b) => b.verificationStatus !== 'VERIFIED').length,
        totalInvestors: inMemoryStore.users.filter((u) => u.role === 'INVESTOR').length,
        totalLeads: inMemoryStore.leads.length,
        totalMeetings: inMemoryStore.meetings.length,
        totalDeals: deals.length,
        totalDealVolumeINR,
        totalCommissionEarnedINR,
        settledCommissionINR,
        pendingCommissionINR,
        revenueStreams: {
          brandSubscriptions: 0,
          dealSuccessFees: totalCommissionEarnedINR,
          premiumBooths: 0,
          investorMemberships: 0,
        },
      },
      recentDeals: deals,
    });
  }

  static async verifyBrand(req: any, res: Response) {
    const { brandId } = req.params;
    const { status, isFeatured, featuredRank } = req.body;
    const brand = inMemoryStore.brands.find((b) => b._id === brandId);
    if (brand) {
      if (status) brand.verificationStatus = status;
      if (typeof isFeatured === 'boolean') brand.isFeatured = isFeatured;
      if (typeof featuredRank === 'number') brand.featuredRank = featuredRank;
      return res.json({ success: true, message: 'Brand updated', brand });
    }
    return res.status(404).json({ success: false, message: 'Brand not found' });
  }

  static async updateCommissionStatus(req: any, res: Response) {
    const { dealId } = req.params;
    const { status, paymentReferenceNo, adminNotes } = req.body;
    const deal = inMemoryStore.deals.find((d) => d._id === dealId);
    if (deal) {
      deal.status = status;
      if (paymentReferenceNo) deal.paymentReferenceNo = paymentReferenceNo;
      if (adminNotes) deal.adminNotes = adminNotes;
      if (status === 'RECEIVED_SETTLED') deal.settledAt = new Date().toISOString();
      return res.json({ success: true, message: `Commission status updated to ${status}`, deal });
    }
    return res.status(404).json({ success: false, message: 'Deal not found' });
  }
}

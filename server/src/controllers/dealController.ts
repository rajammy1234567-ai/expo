import { Response } from 'express';
import { inMemoryStore } from '../store/inMemoryStore';
import { CommissionService } from '../services/commissionService';
import { AuthRequest, getActiveUserBrandId, verifyBrandOwnership } from '../middlewares/authMiddleware';

export class DealController {
  /**
   * Record a new closed franchise deal (Brand Admin or VIZ Admin)
   */
  static async recordDeal(req: AuthRequest, res: Response) {
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

    // Data Scoping: Brand Admin can only record deals for their own brand
    if (req.user?.role === 'BRAND_ADMIN') {
      const userBrandId = getActiveUserBrandId(req);
      if (brandId && brandId !== userBrandId) {
        return res.status(403).json({
          success: false,
          message: 'Forbidden: You can only record deals under your own brand.',
        });
      }
    }

    const effectiveBrandId = brandId || getActiveUserBrandId(req);
    const brand = inMemoryStore.brands.find((b) => b._id === effectiveBrandId) || inMemoryStore.brands[0] || null;
    const user = inMemoryStore.users.find((u) => u._id === investorId) || {
      _id: investorId || 'guest_investor',
      name: 'Investor User',
      phone: '',
      email: '',
    };

    const dealValue = Number(totalDealValueINR);
    if (!dealValue || dealValue <= 0) {
      return res.status(400).json({ success: false, message: 'Valid positive franchise deal value in INR is required.' });
    }

    // Server-side enforced fixed 3% fee (never trust client-supplied rates or tax calculations)
    const financials = CommissionService.calculateDealCommission(dealValue, 3.0);

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
      gstAmountINR: financials.taxINR,
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

  /**
   * Get deals for a specific brand with ownership verification
   */
  static async getBrandDeals(req: AuthRequest, res: Response) {
    const { brandId } = req.params;

    // Data Scoping: Brand Admin can only view their own brand's deals
    if (req.user?.role === 'BRAND_ADMIN') {
      const userBrandId = getActiveUserBrandId(req);
      if (brandId !== userBrandId) {
        return res.status(403).json({
          success: false,
          message: 'Forbidden: You cannot view deals belonging to another brand.',
        });
      }
    }

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

  /**
   * Generic get deals scoped by caller role:
   * - INVESTOR: only deals involving this investor
   * - BRAND_ADMIN: only deals involving this brand
   * - VIZ_ADMIN: all platform deals
   */
  static async getDeals(req: AuthRequest, res: Response) {
    const callerRole = req.user?.role;
    const callerId = req.user?.userId;

    let deals = inMemoryStore.deals;

    if (callerRole === 'INVESTOR') {
      deals = deals.filter(
        (d) =>
          d.investorId?._id === callerId ||
          d.investorId === callerId ||
          (req.user?.email && d.investorId?.email === req.user.email)
      );
    } else if (callerRole === 'BRAND_ADMIN') {
      const userBrandId = getActiveUserBrandId(req);
      deals = deals.filter((d) => d.brandId?._id === userBrandId || d.brandId === userBrandId);
    }

    return res.json({
      success: true,
      count: deals.length,
      deals,
    });
  }
}

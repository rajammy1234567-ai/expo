import { Response } from 'express';
import { inMemoryStore } from '../store/inMemoryStore';
import { AuthRequest, getActiveUserBrandId } from '../middlewares/authMiddleware';

export class LeadController {
  /**
   * Investor creates an enquiry / lead at a brand's booth
   */
  static async createLead(req: AuthRequest, res: Response) {
    const investorId = req.user?.userId;
    if (!investorId) {
      return res.status(401).json({ success: false, message: 'Authentication required' });
    }

    const { brandId, source = 'BOOTH_DISCOVERY', note } = req.body;
    const brand = inMemoryStore.brands.find((b) => b._id === brandId) || inMemoryStore.brands[0] || null;
    const user = inMemoryStore.users.find((u) => u._id === investorId) || {
      _id: investorId,
      name: req.user?.name || 'Investor User',
      phone: '',
      email: req.user?.email || '',
    };

    const lead = {
      _id: `65e3000000000000000000${inMemoryStore.leads.length + 10}`,
      investorId: user,
      brandId: brand,
      source,
      status: 'NEW',
      investorSnapshot: {
        name: user.name,
        phone: user.phone,
        email: user.email,
        city: 'Chandigarh',
        budgetBracket: '₹25L – ₹50L',
        experienceYears: 4,
      },
      brandInternalNotes: note ? [note] : ['Enquired via Expo Booth'],
      dealValueEstimatedINR: brand?.investmentRange?.minINR || 3000000,
      stageHistory: [{ stage: 'NEW', updatedAt: new Date().toISOString(), note: 'Generated via ' + source }],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    inMemoryStore.leads.push(lead);
    return res.json({ success: true, message: 'Lead created', lead });
  }

  /**
   * Brand Admin views leads for their brand.
   * STRICT DATA SCOPING: Brand Admin cannot view leads of another brand by changing brandId in URL.
   */
  static async getBrandLeads(req: AuthRequest, res: Response) {
    const { brandId } = req.params;

    if (req.user?.role === 'BRAND_ADMIN') {
      const userBrandId = getActiveUserBrandId(req);
      if (brandId !== userBrandId) {
        return res.status(403).json({
          success: false,
          message: 'Forbidden: Access denied. You can only view leads for your own brand.',
        });
      }
    }

    const effectiveBrandId = req.user?.role === 'BRAND_ADMIN' ? getActiveUserBrandId(req) : brandId;
    const leads = inMemoryStore.leads.filter(
      (l) => l.brandId?._id === effectiveBrandId || l.brandId === effectiveBrandId
    );

    return res.json({
      success: true,
      stats: {
        total: leads.length,
        new: leads.filter((l) => l.status === 'NEW').length,
        meetings: leads.filter((l) => l.status === 'MEETING_SCHEDULED').length,
        negotiation: leads.filter((l) => l.status === 'NEGOTIATION').length,
        closed: leads.filter((l) => l.status === 'CLOSED_WON').length,
      },
      leads,
    });
  }

  /**
   * Update lead stage in Kanban CRM (Brand Admin can only update their own leads)
   */
  static async updateLeadStage(req: AuthRequest, res: Response) {
    const { leadId } = req.params;
    const { status, note, closedDealValueINR } = req.body;

    const lead = inMemoryStore.leads.find((l) => l._id === leadId);
    if (!lead) {
      return res.status(404).json({ success: false, message: 'Lead not found' });
    }

    // Ownership check: Lead must belong to the caller's brand
    if (req.user?.role === 'BRAND_ADMIN') {
      const userBrandId = getActiveUserBrandId(req);
      const isLeadOwner = lead.brandId?._id === userBrandId || lead.brandId === userBrandId;
      if (!isLeadOwner) {
        return res.status(403).json({
          success: false,
          message: 'Forbidden: You can only update leads for your own brand.',
        });
      }
    }

    lead.status = status;
    if (closedDealValueINR) lead.closedDealValueINR = closedDealValueINR;
    if (note) lead.brandInternalNotes.push(note);
    lead.stageHistory.push({ stage: status, updatedAt: new Date().toISOString(), note });
    return res.json({ success: true, message: `Moved to ${status}`, lead });
  }

  /**
   * Investor views only their own deals/enquiries
   */
  static async getInvestorDeals(req: AuthRequest, res: Response) {
    const callerId = req.user?.userId;
    const callerEmail = req.user?.email;

    const investorLeads = inMemoryStore.leads.filter(
      (l) =>
        l.investorId?._id === callerId ||
        l.investorId === callerId ||
        (callerEmail && l.investorId?.email === callerEmail)
    );

    return res.json({
      success: true,
      count: investorLeads.length,
      deals: investorLeads,
    });
  }
}

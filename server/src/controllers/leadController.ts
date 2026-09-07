import { Response } from 'express';
import { inMemoryStore } from '../store/inMemoryStore';

export class LeadController {
  static async createLead(req: any, res: Response) {
    const investorId = req.user?.userId || inMemoryStore.users[0]?._id || 'guest_investor';
    const { brandId, source = 'BOOTH_DISCOVERY', note } = req.body;
    const brand = inMemoryStore.brands.find((b) => b._id === brandId) || inMemoryStore.brands[0] || null;
    const user = inMemoryStore.users.find((u) => u._id === investorId) || inMemoryStore.users[0] || { name: 'Investor User', phone: '', email: '' };

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

  static async getBrandLeads(req: any, res: Response) {
    const { brandId } = req.params;
    const leads = inMemoryStore.leads.filter((l) => l.brandId?._id === brandId || l.brandId === brandId);

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

  static async updateLeadStage(req: any, res: Response) {
    const { leadId } = req.params;
    const { status, note, closedDealValueINR } = req.body;
    const lead = inMemoryStore.leads.find((l) => l._id === leadId);
    if (lead) {
      lead.status = status;
      if (closedDealValueINR) lead.closedDealValueINR = closedDealValueINR;
      if (note) lead.brandInternalNotes.push(note);
      lead.stageHistory.push({ stage: status, updatedAt: new Date().toISOString(), note });
      return res.json({ success: true, message: `Moved to ${status}`, lead });
    }
    return res.status(404).json({ success: false, message: 'Lead not found' });
  }

  static async getInvestorDeals(req: any, res: Response) {
    return res.json({
      success: true,
      count: inMemoryStore.leads.length,
      deals: inMemoryStore.leads,
    });
  }
}

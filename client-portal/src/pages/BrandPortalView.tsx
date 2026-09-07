import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { IBrand, ILead, IDealCommission } from '../types';
import { brandApi, leadApi, dealApi } from '../services/api';
import {
  Users,
  Calendar,
  DollarSign,
  TrendingUp,
  Building2,
  Sparkles,
  CheckCircle2,
  Clock,
  ArrowRight,
  Plus,
  Edit3,
  Video,
  FileCheck,
  Award,
} from 'lucide-react';

export const BrandPortalView: React.FC = () => {
  const { user } = useAuth();
  const [brand, setBrand] = useState<IBrand | null>(null);
  const [leads, setLeads] = useState<ILead[]>([]);
  const [deals, setDeals] = useState<IDealCommission[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'pipeline' | 'booth' | 'ai-kb' | 'deals'>('pipeline');

  // New KB Chunk Form
  const [newQuestion, setNewQuestion] = useState('');
  const [newAnswer, setNewAnswer] = useState('');
  const [kbTitle, setKbTitle] = useState('');

  // Record Deal Modal
  const [showRecordDeal, setShowRecordDeal] = useState(false);
  const [dealCity, setDealCity] = useState('Chandigarh');
  const [dealValueINR, setDealValueINR] = useState(3000000);
  const [selectedLeadId, setSelectedLeadId] = useState('');
  const [selectedInvestorId, setSelectedInvestorId] = useState('');

  const brandId = user?.brandId || '65e999999999999999999999';

  const loadBrandData = async () => {
    setLoading(true);
    try {
      // Fetch all brands to locate this brand
      const bRes = await brandApi.getBrands({ verifiedOnly: 'false' });
      if (bRes.data.success && bRes.data.brands.length > 0) {
        const found = bRes.data.brands.find((b: IBrand) => b._id === user?.brandId) || bRes.data.brands[0];
        setBrand(found);

        // Fetch leads for this brand
        const [lRes, dRes] = await Promise.all([
          leadApi.getBrandLeads(found._id).catch(() => ({ data: { leads: [] } })),
          dealApi.getBrandDeals(found._id).catch(() => ({ data: { deals: [] } })),
        ]);

        if (lRes.data.leads) setLeads(lRes.data.leads);
        if (dRes.data.deals) setDeals(dRes.data.deals);
      }
    } catch (err) {
      console.error('Error fetching brand portal data', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadBrandData();
  }, [user]);

  const handleStageChange = async (leadId: string, newStatus: string) => {
    try {
      await leadApi.updateStage(leadId, newStatus, `Moved to ${newStatus}`);
      setLeads((prev) =>
        prev.map((l) => (l._id === leadId ? { ...l, status: newStatus as any } : l))
      );
    } catch (err) {
      console.error('Failed to change stage', err);
    }
  };

  const handleAddKB = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!brand || !newQuestion || !newAnswer) return;
    try {
      await brandApi.addKBChunk(brand._id, {
        title: kbTitle || newQuestion,
        question: newQuestion,
        answer: newAnswer,
        sourceType: 'FAQ_MANUAL',
      });
      alert('Knowledge base chunk added! AI Bot updated.');
      setNewQuestion('');
      setNewAnswer('');
      setKbTitle('');
    } catch (err) {
      console.error(err);
    }
  };

  const handleRecordDealSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!brand) return;
    try {
      await dealApi.recordDeal({
        brandId: brand._id,
        investorId: selectedInvestorId || user?.id,
        leadId: selectedLeadId || undefined,
        franchiseCity: dealCity,
        totalDealValueINR: dealValueINR,
        commissionRatePercentage: 3.0,
        brandNotes: `Franchise agreement finalized for ${dealCity}`,
      });
      alert('Deal recorded successfully! VIZ 3% commission invoice generated.');
      setShowRecordDeal(false);
      loadBrandData();
    } catch (err) {
      console.error(err);
      alert('Error recording deal');
    }
  };

  const pipelineColumns = [
    { id: 'NEW', title: 'New Leads', color: 'border-blue-500' },
    { id: 'CONTACTED', title: 'Contacted / AI Chat', color: 'border-cyan-500' },
    { id: 'MEETING_SCHEDULED', title: 'Meeting Scheduled', color: 'border-amber-500' },
    { id: 'NEGOTIATION', title: 'Negotiation', color: 'border-purple-500' },
    { id: 'CLOSED_WON', title: 'Closed Won (Deal)', color: 'border-emerald-500' },
  ];

  return (
    <div className="space-y-6 pb-20">
      {/* Brand Top Header */}
      <div className="rounded-3xl p-6 sm:p-8 bg-gradient-to-r from-purple-950/80 via-slate-900 to-slate-900 border border-purple-800/40 shadow-xl flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
        <div className="flex items-center gap-4">
          {brand?.logoUrl && (
            <img
              src={brand.logoUrl}
              alt={brand.brandName}
              className="w-14 h-14 rounded-2xl object-cover border border-purple-500/50 shadow-md"
            />
          )}
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-2xl font-black text-white tracking-tight font-['Outfit']">
                {brand?.brandName || 'Brand Management Portal'}
              </h1>
              <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-purple-500/20 text-purple-300 border border-purple-500/40">
                Premium Booth Plan
              </span>
            </div>
            <p className="text-xs text-slate-300 mt-0.5">
              Live Expo Booth Floor CRM & Deal Pipeline Engine
            </p>
          </div>
        </div>

        <button
          onClick={() => setShowRecordDeal(true)}
          className="px-4 py-2.5 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-400 hover:to-teal-500 text-slate-950 font-bold text-xs flex items-center gap-2 shadow-lg shadow-emerald-500/20"
        >
          <Award className="w-4 h-4" />
          <span>Record Closed Franchise Deal</span>
        </button>
      </div>

      {/* Metrics Row */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="p-4 rounded-2xl bg-slate-900 border border-slate-800 space-y-1">
          <span className="text-xs text-slate-400 flex items-center gap-1">
            <Users className="w-3.5 h-3.5 text-blue-400" />
            Total Leads
          </span>
          <p className="text-2xl font-black text-white">{leads.length}</p>
          <span className="text-[10px] text-slate-400 font-semibold">Active inquiries</span>
        </div>

        <div className="p-4 rounded-2xl bg-slate-900 border border-slate-800 space-y-1">
          <span className="text-xs text-slate-400 flex items-center gap-1">
            <Calendar className="w-3.5 h-3.5 text-amber-400" />
            Live Meetings
          </span>
          <p className="text-2xl font-black text-amber-400">
            {leads.filter((l) => l.status === 'MEETING_SCHEDULED').length}
          </p>
          <span className="text-[10px] text-slate-400">Discovery calls booked</span>
        </div>

        <div className="p-4 rounded-2xl bg-slate-900 border border-slate-800 space-y-1">
          <span className="text-xs text-slate-400 flex items-center gap-1">
            <TrendingUp className="w-3.5 h-3.5 text-purple-400" />
            Active Negotiations
          </span>
          <p className="text-2xl font-black text-purple-300">
            {leads.filter((l) => l.status === 'NEGOTIATION').length}
          </p>
          <span className="text-[10px] text-purple-400 font-semibold">High intent deals</span>
        </div>

        <div className="p-4 rounded-2xl bg-slate-900 border border-slate-800 space-y-1">
          <span className="text-xs text-slate-400 flex items-center gap-1">
            <DollarSign className="w-3.5 h-3.5 text-emerald-400" />
            Closed Deal Volume
          </span>
          <p className="text-2xl font-black text-emerald-400">
            ₹{((deals.reduce((a, b) => a + b.totalDealValueINR, 0)) / 100000).toFixed(1)}L
          </p>
          <span className="text-[10px] text-slate-400">Agreed 3% Success Fee</span>
        </div>
      </div>

      {/* Sub-Navigation Tabs */}
      <div className="flex items-center gap-2 border-b border-slate-800 pb-2">
        {[
          { id: 'pipeline', label: 'Lead & Deals Pipeline' },
          { id: 'ai-kb', label: 'AI Franchise Bot Trainer' },
          { id: 'deals', label: `Closed Deals (${deals.length})` },
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id as any)}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${
              activeTab === tab.id
                ? 'bg-purple-600 text-white shadow-md shadow-purple-600/30'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Pipeline Kanban View */}
      {activeTab === 'pipeline' && (
        <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-4 overflow-x-auto pb-4">
          {pipelineColumns.map((col) => {
            const colLeads = leads.filter((l) => l.status === col.id);
            return (
              <div key={col.id} className="bg-slate-900/70 border border-slate-800 rounded-2xl p-3 space-y-3 min-w-[240px]">
                <div className="flex items-center justify-between border-b border-slate-800 pb-2">
                  <h3 className="text-xs font-bold text-slate-200 flex items-center gap-1.5">
                    <span className={`w-2 h-2 rounded-full border-2 ${col.color} bg-white`}></span>
                    <span>{col.title}</span>
                  </h3>
                  <span className="text-[11px] font-bold text-slate-400 bg-slate-950 px-2 py-0.5 rounded-full">
                    {colLeads.length}
                  </span>
                </div>

                <div className="space-y-2.5">
                  {colLeads.length === 0 ? (
                    <div className="p-4 text-center text-[11px] text-slate-500 italic">No leads in stage</div>
                  ) : (
                    colLeads.map((lead) => (
                      <div
                        key={lead._id}
                        className="p-3 rounded-xl bg-slate-950 border border-slate-800/80 hover:border-purple-500/50 transition-all space-y-2 shadow-sm"
                      >
                        <div className="flex items-start justify-between">
                          <div>
                            <h4 className="text-xs font-bold text-white">{lead.investorSnapshot?.name || 'Investor'}</h4>
                            <p className="text-[10px] text-slate-400">{lead.investorSnapshot?.city} • {lead.investorSnapshot?.budgetBracket}</p>
                          </div>
                          <span className="text-[9px] px-1.5 py-0.5 rounded bg-slate-900 text-slate-400 border border-slate-800 uppercase font-semibold">
                            {lead.source}
                          </span>
                        </div>

                        <div className="text-[11px] text-slate-300 bg-slate-900/60 p-2 rounded-lg border border-slate-800/50">
                          📞 {lead.investorSnapshot?.phone}
                        </div>

                        {/* Stage Mover Dropdown */}
                        <div className="pt-1 flex items-center justify-between text-[10px]">
                          <span className="text-slate-500">Move to:</span>
                          <select
                            value={lead.status}
                            onChange={(e) => handleStageChange(lead._id, e.target.value)}
                            className="bg-slate-900 border border-slate-700 text-slate-200 rounded-lg px-2 py-1 text-[10px] focus:outline-none focus:border-purple-500"
                          >
                            <option value="NEW">New</option>
                            <option value="CONTACTED">Contacted</option>
                            <option value="MEETING_SCHEDULED">Meeting</option>
                            <option value="NEGOTIATION">Negotiation</option>
                            <option value="CLOSED_WON">Closed Won</option>
                          </select>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* AI Knowledge Base Trainer */}
      {activeTab === 'ai-kb' && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 space-y-4">
            <div className="flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-purple-400" />
              <h3 className="font-bold text-white text-base">Train Brand AI Assistant</h3>
            </div>
            <p className="text-xs text-slate-400">
              Upload approved FAQs and financial breakdowns. The AI Franchise Assistant will strictly ground all investor answers on these facts.
            </p>

            <form onSubmit={handleAddKB} className="space-y-3">
              <div>
                <label className="text-xs font-semibold text-slate-300 block mb-1">Topic Title</label>
                <input
                  type="text"
                  value={kbTitle}
                  onChange={(e) => setKbTitle(e.target.value)}
                  placeholder="e.g. Master Franchise Rights in Punjab"
                  className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-purple-500"
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-300 block mb-1">Expected Investor Question</label>
                <input
                  type="text"
                  value={newQuestion}
                  onChange={(e) => setNewQuestion(e.target.value)}
                  placeholder="e.g. Do you offer raw material credit?"
                  className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-purple-500"
                  required
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-300 block mb-1">Approved Brand Answer</label>
                <textarea
                  value={newAnswer}
                  onChange={(e) => setNewAnswer(e.target.value)}
                  rows={4}
                  placeholder="Enter the official approved answer with historical/estimated disclaimers..."
                  className="w-full bg-slate-950 border border-slate-700 rounded-xl p-3 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-purple-500 resize-none"
                  required
                ></textarea>
              </div>

              <button
                type="submit"
                className="w-full py-2.5 rounded-xl bg-purple-600 hover:bg-purple-500 text-white font-bold text-xs flex items-center justify-center gap-1.5 shadow-md shadow-purple-600/30"
              >
                <Plus className="w-4 h-4" />
                <span>Save to AI Knowledge Base</span>
              </button>
            </form>
          </div>

          <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 space-y-4">
            <h3 className="font-bold text-white text-base">Current AI Safety Rules & Telemetry</h3>
            <div className="space-y-3 text-xs">
              <div className="p-3 rounded-2xl bg-slate-950 border border-slate-800 space-y-1">
                <p className="font-bold text-emerald-400">🛡️ Grounding Safeguard 100%</p>
                <p className="text-slate-400">AI automatically appends operational disclaimers on ROI and payback.</p>
              </div>
              <div className="p-3 rounded-2xl bg-slate-950 border border-slate-800 space-y-1">
                <p className="font-bold text-blue-400">📍 Territorial Exclusivity Trigger</p>
                <p className="text-slate-400">Directs investors to book Live Meeting if city status is unconfirmed.</p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Closed Deals View */}
      {activeTab === 'deals' && (
        <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 space-y-4">
          <h3 className="font-bold text-white text-base">Closed Deals & VIZ 3% Commission Status</h3>
          {deals.length === 0 ? (
            <p className="text-xs text-slate-400">No closed deals registered yet. Use "Record Closed Franchise Deal" button above.</p>
          ) : (
            <div className="space-y-3">
              {deals.map((d) => (
                <div key={d._id} className="p-4 rounded-2xl bg-slate-950 border border-slate-800 flex items-center justify-between">
                  <div>
                    <h4 className="text-xs font-bold text-white">{d.dealNumber} • {d.franchiseCity}</h4>
                    <p className="text-[11px] text-slate-400">
                      Total Deal Value: <strong className="text-emerald-400">₹{(d.totalDealValueINR / 100000).toFixed(1)}L</strong> ({d.franchiseUnitModel})
                    </p>
                  </div>
                  <div className="text-right">
                    <span className="text-xs font-bold text-amber-400 block">
                      3% Commission: ₹{d.calculatedCommissionINR.toLocaleString()}
                    </span>
                    <span className="text-[10px] px-2 py-0.5 rounded-full bg-slate-900 border border-slate-700 text-slate-300">
                      Status: {d.status}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Record Deal Modal */}
      {showRecordDeal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-fadeIn">
          <div className="relative w-full max-w-md bg-slate-900 border border-slate-700 rounded-2xl p-6 space-y-4">
            <h3 className="font-bold text-white text-base">Record Franchise Deal Closure</h3>
            <p className="text-xs text-slate-400">
              Logs successful closure and initiates agreed 3% VIZ success fee reconciliation.
            </p>

            <form onSubmit={handleRecordDealSubmit} className="space-y-3">
              <div>
                <label className="text-xs font-semibold text-slate-300 block mb-1">Franchise Territory / City</label>
                <input
                  type="text"
                  value={dealCity}
                  onChange={(e) => setDealCity(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-purple-500"
                  required
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-300 block mb-1">Total Agreement Deal Value (INR)</label>
                <input
                  type="number"
                  value={dealValueINR}
                  onChange={(e) => setDealValueINR(Number(e.target.value))}
                  className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-purple-500"
                  required
                />
              </div>

              <div className="p-3 rounded-xl bg-slate-950 border border-slate-800 text-xs space-y-1">
                <div className="flex justify-between text-slate-300">
                  <span>VIZ Agreed Success Fee (3%):</span>
                  <span className="font-bold text-amber-400">₹{((dealValueINR * 3) / 100).toLocaleString()}</span>
                </div>
                <div className="flex justify-between text-slate-400 text-[11px]">
                  <span>GST (18%):</span>
                  <span>₹{(((dealValueINR * 3) / 100) * 0.18).toLocaleString()}</span>
                </div>
              </div>

              <div className="flex gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowRecordDeal(false)}
                  className="flex-1 py-2 rounded-xl bg-slate-800 text-slate-300 text-xs font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold"
                >
                  Confirm & Submit
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

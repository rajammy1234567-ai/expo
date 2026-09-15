import React, { useState, useEffect } from 'react';
import { leadApi, dealApi } from '../services/api';
import { ILead, IDealCommission } from '../types';
import {
  TrendingUp,
  Building,
  CheckCircle2,
  Clock,
  ArrowRight,
  ShieldCheck,
  Calendar,
  DollarSign,
  FileText,
  Award,
} from 'lucide-react';

export const MyDealsView: React.FC = () => {
  const [pipelineLeads, setPipelineLeads] = useState<ILead[]>([]);
  const [closedDeals, setClosedDeals] = useState<IDealCommission[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'closed' | 'pipeline'>('closed');

  useEffect(() => {
    const fetchDeals = async () => {
      try {
        const [lRes, dRes] = await Promise.all([
          leadApi.getMyDeals().catch(() => ({ data: { success: false, deals: [] } })),
          dealApi.getDeals().catch(() => ({ data: { success: false, deals: [] } })),
        ]);
        if (lRes.data?.success && lRes.data?.deals) {
          setPipelineLeads(lRes.data.deals);
        }
        if (dRes.data?.success && dRes.data?.deals) {
          setClosedDeals(dRes.data.deals);
        }
      } catch (err) {
        console.error('Error fetching investor deals data', err);
      } finally {
        setLoading(false);
      }
    };
    fetchDeals();
  }, []);

  return (
    <div className="space-y-6 pb-20">
      <div>
        <h1 className="text-2xl font-black text-white tracking-tight font-['Outfit'] flex items-center gap-2">
          <span>🤝 My Franchise Deals & Commitments</span>
        </h1>
        <p className="text-xs text-slate-400 mt-1">
          Track official closed franchise agreements, 3% success fee invoices, and active due diligence pipelines.
        </p>
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-2 border-b border-slate-800 pb-2">
        <button
          onClick={() => setActiveTab('closed')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 ${
            activeTab === 'closed'
              ? 'bg-emerald-600 text-white shadow-md shadow-emerald-600/30'
              : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900'
          }`}
        >
          <Award className="w-3.5 h-3.5" />
          <span>Closed Agreements & Invoices ({closedDeals.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('pipeline')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 ${
            activeTab === 'pipeline'
              ? 'bg-blue-600 text-white shadow-md shadow-blue-600/30'
              : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900'
          }`}
        >
          <TrendingUp className="w-3.5 h-3.5" />
          <span>Active Inquiries & Pipeline ({pipelineLeads.length})</span>
        </button>
      </div>

      {loading ? (
        <div className="p-12 text-center text-slate-400">Loading your deals data...</div>
      ) : activeTab === 'closed' ? (
        /* Tab 1: Closed Deals from DealCommission Store */
        closedDeals.length === 0 ? (
          <div className="p-12 rounded-3xl bg-slate-900 border border-slate-800 text-center space-y-3">
            <Award className="w-12 h-12 mx-auto text-slate-600" />
            <p className="text-sm font-semibold text-slate-300">No closed franchise deals on record yet.</p>
            <p className="text-xs text-slate-500">
              When a franchise agreement is executed with a brand franchisor, the official certificate and invoice will appear here.
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {closedDeals.map((deal) => (
              <div
                key={deal._id}
                className="p-6 rounded-3xl bg-slate-900 border border-slate-800 shadow-xl space-y-4"
              >
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-800/80 pb-4">
                  <div className="flex items-center gap-3.5">
                    <div className="w-12 h-12 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-400 font-bold text-lg">
                      ₹
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <h3 className="text-base font-bold text-white">
                          {(deal.brandId as any)?.brandName || 'Brand Franchise'}
                        </h3>
                        <span className="font-mono text-[10px] px-2 py-0.5 rounded-full bg-slate-800 text-cyan-300 border border-slate-700">
                          {deal.dealNumber}
                        </span>
                      </div>
                      <p className="text-xs text-slate-400">
                        {deal.franchiseCity} • {deal.franchiseUnitModel} Model • Executed on {new Date(deal.createdAt).toLocaleDateString()}
                      </p>
                    </div>
                  </div>

                  <span
                    className={`px-3 py-1 rounded-full text-xs font-bold self-start sm:self-auto ${
                      deal.status === 'RECEIVED_SETTLED'
                        ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40'
                        : deal.status === 'INVOICE_SENT' || deal.status === 'INVOICED'
                        ? 'bg-blue-500/20 text-blue-300 border border-blue-500/40'
                        : 'bg-amber-500/20 text-amber-300 border border-amber-500/40'
                    }`}
                  >
                    {deal.status === 'RECEIVED_SETTLED' ? '✓ Received & Settled' : deal.status}
                  </span>
                </div>

                {/* Economics Grid */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 bg-slate-950/80 p-4 rounded-2xl border border-slate-800/80 text-xs">
                  <div>
                    <span className="text-[10px] text-slate-500 uppercase tracking-wider block">Deal Value</span>
                    <span className="font-bold text-emerald-400 text-sm">
                      ₹{((deal.totalDealValueINR || 0) / 100000).toFixed(1)} Lakh
                    </span>
                  </div>
                  <div>
                    <span className="text-[10px] text-slate-500 uppercase tracking-wider block">3% Platform Fee</span>
                    <span className="font-bold text-white text-sm">
                      ₹{(deal.calculatedCommissionINR || 0).toLocaleString()}
                    </span>
                  </div>
                  <div>
                    <span className="text-[10px] text-slate-500 uppercase tracking-wider block">18% GST</span>
                    <span className="font-bold text-slate-300 text-sm">
                      ₹{(deal.gstAmountINR || Math.round((deal.calculatedCommissionINR || 0) * 0.18)).toLocaleString()}
                    </span>
                  </div>
                  <div>
                    <span className="text-[10px] text-slate-500 uppercase tracking-wider block">Total Invoice</span>
                    <span className="font-black text-amber-400 text-sm">
                      ₹{(deal.totalInvoiceAmountINR || 0).toLocaleString()}
                    </span>
                  </div>
                </div>

                {deal.bankSettlementRef && (
                  <div className="text-xs text-slate-400 flex items-center gap-2 bg-emerald-950/20 border border-emerald-500/20 p-2.5 rounded-xl text-[11px]">
                    <ShieldCheck className="w-4 h-4 text-emerald-400" />
                    <span>Bank Settlement Ref: <strong className="text-emerald-300 font-mono">{deal.bankSettlementRef}</strong></span>
                  </div>
                )}
              </div>
            ))}
          </div>
        )
      ) : (
        /* Tab 2: Pipeline Leads */
        pipelineLeads.length === 0 ? (
          <div className="p-12 rounded-3xl bg-slate-900 border border-slate-800 text-center space-y-3">
            <Building className="w-12 h-12 mx-auto text-slate-600" />
            <p className="text-sm font-semibold text-slate-300">No active enquiries yet.</p>
            <p className="text-xs text-slate-500">
              Browse the Expo Floor, interact with Brand AI, or request discovery calls to start your pipeline.
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {pipelineLeads.map((deal) => (
              <div
                key={deal._id}
                className="p-6 rounded-3xl bg-slate-900 border border-slate-800 shadow-xl space-y-4"
              >
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div className="flex items-center gap-3">
                    <img
                      src={deal.brandId?.logoUrl || 'https://images.unsplash.com/photo-1571091718767-18b5b1457add?w=100'}
                      alt="Brand"
                      className="w-12 h-12 rounded-xl object-cover border border-slate-700"
                    />
                    <div>
                      <h3 className="text-base font-bold text-white">
                        {deal.brandId?.brandName || 'Brand Opportunity'}
                      </h3>
                      <p className="text-xs text-slate-400">
                        {deal.brandId?.category} • Investment: <strong className="text-emerald-400">{deal.brandId?.investmentRange?.displayString || '₹30L – ₹40L'}</strong>
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <span className="text-xs font-semibold px-3 py-1 rounded-full bg-blue-500/20 text-blue-300 border border-blue-500/30">
                      Stage: {deal.status}
                    </span>
                  </div>
                </div>

                {/* Progress Milestones */}
                <div className="grid grid-cols-2 sm:grid-cols-5 gap-2 pt-2">
                  {[
                    { name: '1. New Lead', done: true },
                    { name: '2. Meeting', done: ['MEETING_SCHEDULED', 'MEETING_COMPLETED', 'NEGOTIATION', 'CLOSED_WON'].includes(deal.status) },
                    { name: '3. Negotiation', done: ['NEGOTIATION', 'CLOSED_WON'].includes(deal.status) },
                    { name: '4. Agreement', done: ['AGREEMENT_SIGNED', 'CLOSED_WON'].includes(deal.status) },
                    { name: '5. Closed Won', done: deal.status === 'CLOSED_WON' },
                  ].map((st, i) => (
                    <div
                      key={i}
                      className={`p-2.5 rounded-xl border text-center text-xs font-semibold transition-all ${
                        st.done
                          ? 'bg-emerald-500/10 border-emerald-500/40 text-emerald-300'
                          : 'bg-slate-950/60 border-slate-800 text-slate-500'
                      }`}
                    >
                      <span className="block">{st.name}</span>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        )
      )}
    </div>
  );
};

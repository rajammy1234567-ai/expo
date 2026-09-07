import React, { useState, useEffect } from 'react';
import { leadApi } from '../services/api';
import { ILead } from '../types';
import {
  TrendingUp,
  Building,
  CheckCircle2,
  Clock,
  ArrowRight,
  ShieldCheck,
  Calendar,
} from 'lucide-react';

export const MyDealsView: React.FC = () => {
  const [deals, setDeals] = useState<ILead[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchDeals = async () => {
      try {
        const res = await leadApi.getMyDeals();
        if (res.data.success) {
          setDeals(res.data.deals);
        }
      } catch (err) {
        console.error(err);
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
          <span>🤝 My Franchise Deals Pipeline</span>
          <span className="text-xs px-2.5 py-0.5 rounded-full bg-blue-500/20 text-blue-400 border border-blue-500/30">
            {deals.length} Active
          </span>
        </h1>
        <p className="text-xs text-slate-400 mt-1">
          Track negotiations, meeting outcomes, due diligence and agreement milestones in real time.
        </p>
      </div>

      {loading ? (
        <div className="p-12 text-center text-slate-400">Loading your deals pipeline...</div>
      ) : deals.length === 0 ? (
        <div className="p-12 rounded-3xl bg-slate-900 border border-slate-800 text-center space-y-3">
          <Building className="w-12 h-12 mx-auto text-slate-600" />
          <p className="text-sm font-semibold text-slate-300">No active franchise enquiries yet.</p>
          <p className="text-xs text-slate-500">
            Browse the Expo Floor, interact with Brand AI, or request discovery calls to start your pipeline.
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {deals.map((deal) => (
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
      )}
    </div>
  );
};

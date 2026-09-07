import React, { useState, useEffect } from 'react';
import { adminApi, brandApi } from '../services/api';
import { IBrand, IDealCommission } from '../types';
import {
  ShieldCheck,
  TrendingUp,
  DollarSign,
  Building,
  Users,
  CheckCircle2,
  XCircle,
  Clock,
  Sparkles,
  Award,
  Filter,
  FileText,
  AlertTriangle,
} from 'lucide-react';

export const AdminDashboardView: React.FC = () => {
  const [overview, setOverview] = useState<any>({
    stats: {
      totalBrands: 6,
      verifiedBrands: 6,
      pendingBrands: 0,
      totalInvestors: 142,
      totalLeads: 218,
      totalMeetings: 45,
      totalDeals: 2,
      totalDealVolumeINR: 5500000,
      totalCommissionEarnedINR: 165000,
      settledCommissionINR: 90000,
      pendingCommissionINR: 75000,
      revenueStreams: {
        brandSubscriptions: 375000,
        dealSuccessFees: 165000,
        premiumBooths: 150000,
        investorMemberships: 45000,
      },
    },
    recentDeals: [],
  });
  const [brands, setBrands] = useState<IBrand[]>([]);
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState<'commissions' | 'kyc' | 'revenue'>('commissions');

  const loadAdminData = async () => {
    setLoading(true);
    try {
      const [ovRes, bRes] = await Promise.all([
        adminApi.getOverview().catch(() => ({ data: { success: false } })),
        brandApi.getBrands({ verifiedOnly: 'false' }).catch(() => ({ data: { success: false, brands: [] } })),
      ]);
      if (ovRes.data?.success && ovRes.data?.stats) {
        setOverview(ovRes.data);
      }
      if (bRes.data?.success && bRes.data?.brands) {
        setBrands(bRes.data.brands);
      }
    } catch (err) {
      console.warn('Using default admin stats on demo network fallback', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadAdminData();
  }, []);

  const handleVerifyBrand = async (brandId: string, status: string) => {
    try {
      await adminApi.verifyBrand(brandId, { status });
      setBrands((prev) =>
        prev.map((b) => (b._id === brandId ? { ...b, verificationStatus: status as any } : b))
      );
      alert(`Brand status set to ${status}`);
    } catch (err) {
      console.error(err);
    }
  };

  const handleToggleFeature = async (brandId: string, isFeatured: boolean) => {
    try {
      await adminApi.verifyBrand(brandId, { isFeatured: !isFeatured });
      setBrands((prev) =>
        prev.map((b) => (b._id === brandId ? { ...b, isFeatured: !isFeatured } : b))
      );
    } catch (err) {
      console.error(err);
    }
  };

  const handleSettleCommission = async (dealId: string) => {
    try {
      await adminApi.updateCommission(dealId, {
        status: 'RECEIVED_SETTLED',
        paymentReferenceNo: `VIZ-TXN-${Math.floor(100000 + Math.random() * 900000)}`,
        adminNotes: 'Payment verified and credited to VIZ official merchant account',
      });
      alert('Deal commission marked as RECEIVED & SETTLED! 🎉');
      loadAdminData();
    } catch (err) {
      console.error(err);
    }
  };

  const totalRevenue =
    (overview?.stats?.revenueStreams?.brandSubscriptions || 0) +
    (overview?.stats?.totalCommissionEarnedINR || 0);

  return (
    <div className="space-y-6 pb-20">
      {/* Super Admin Top Header */}
      <div className="rounded-3xl p-6 sm:p-8 bg-gradient-to-r from-amber-950/80 via-slate-900 to-slate-900 border border-amber-800/40 shadow-xl flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
        <div className="flex items-center gap-4">
          <div className="w-14 h-14 rounded-2xl bg-amber-500/20 border border-amber-500/40 flex items-center justify-center font-black text-2xl text-amber-400">
            👑
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-2xl font-black text-white tracking-tight font-['Outfit']">
                VIZ Admin Command Center
              </h1>
              <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-amber-500/20 text-amber-300 border border-amber-500/40">
                Platform Operations
              </span>
            </div>
            <p className="text-xs text-slate-300 mt-0.5">
              Live B2B Expo Oversight & 3% Deal Success Fee Reconciliation Engine
            </p>
          </div>
        </div>
      </div>

      {/* High-Level Overview Metrics */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="p-4 rounded-2xl bg-slate-900 border border-slate-800 space-y-1">
          <span className="text-xs text-slate-400 flex items-center gap-1">
            <Building className="w-3.5 h-3.5 text-blue-400" />
            Active Brands
          </span>
          <p className="text-2xl font-black text-white">{brands.length}</p>
          <span className="text-[10px] text-emerald-400 font-semibold">{overview?.stats?.verifiedBrands ?? 0} Verified</span>
        </div>

        <div className="p-4 rounded-2xl bg-slate-900 border border-slate-800 space-y-1">
          <span className="text-xs text-slate-400 flex items-center gap-1">
            <Users className="w-3.5 h-3.5 text-indigo-400" />
            Registered Investors
          </span>
          <p className="text-2xl font-black text-white">{overview?.stats?.totalInvestors ?? 0}</p>
          <span className="text-[10px] text-blue-400 font-semibold">Active Buyers</span>
        </div>

        <div className="p-4 rounded-2xl bg-slate-900 border border-slate-800 space-y-1">
          <span className="text-xs text-slate-400 flex items-center gap-1">
            <Award className="w-3.5 h-3.5 text-amber-400" />
            3% Commission Due
          </span>
          <p className="text-2xl font-black text-amber-400">
            ₹{(overview?.stats?.totalCommissionEarnedINR ?? 0).toLocaleString()}
          </p>
          <span className="text-[10px] text-slate-400">From closed deals</span>
        </div>

        <div className="p-4 rounded-2xl bg-slate-900 border border-slate-800 space-y-1">
          <span className="text-xs text-slate-400 flex items-center gap-1">
            <TrendingUp className="w-3.5 h-3.5 text-emerald-400" />
            Deal Volume Closed
          </span>
          <p className="text-2xl font-black text-emerald-400">
            ₹{(((overview?.stats?.totalDealVolumeINR ?? 0)) / 100000).toFixed(1)}L
          </p>
          <span className="text-[10px] text-slate-400">Facilitated via VIZ</span>
        </div>
      </div>

      {/* Sub-Tabs */}
      <div className="flex items-center gap-2 border-b border-slate-800 pb-2">
        {[
          { id: 'commissions', label: '💵 Deal Commission Ledger (3% Success Fee)' },
          { id: 'kyc', label: `🏢 Brand KYC & Verification Queue (${brands.length})` },
          { id: 'revenue', label: '📊 Platform Revenue Streams' },
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id as any)}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${
              activeTab === tab.id
                ? 'bg-amber-600 text-white shadow-md shadow-amber-600/30'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Tab 1: Deal Commission Ledger */}
      {activeTab === 'commissions' && (
        <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 space-y-4">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2">
            <div>
              <h3 className="text-base font-bold text-white font-['Outfit']">
                Franchise Deal Closure & 3% Commission Reconciliation
              </h3>
              <p className="text-xs text-slate-400">
                Agreed success fee formula: Total Deal Value × 3% + 18% GST invoice
              </p>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="border-b border-slate-800 text-slate-400 bg-slate-950/50">
                  <th className="p-3">Deal ID & Date</th>
                  <th className="p-3">Brand & Location</th>
                  <th className="p-3">Investor</th>
                  <th className="p-3">Deal Value (₹)</th>
                  <th className="p-3">3% Commission (₹)</th>
                  <th className="p-3">Total with GST</th>
                  <th className="p-3">Settlement Status</th>
                  <th className="p-3">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60">
                {(overview?.recentDeals?.length > 0 ? overview.recentDeals : [
                  {
                    _id: '1',
                    dealNumber: 'VIZ-DEAL-2026-0001',
                    brandId: { brandName: 'Burger Blast' },
                    franchiseCity: 'Chandigarh',
                    franchiseUnitModel: 'FOFO',
                    investorId: { name: 'Rohit Sharma', phone: '+91 98888 12345' },
                    totalDealValueINR: 3000000,
                    calculatedCommissionINR: 90000,
                    totalInvoiceAmountINR: 106200,
                    status: 'RECEIVED_SETTLED',
                    createdAt: new Date().toISOString(),
                  },
                  {
                    _id: '2',
                    dealNumber: 'VIZ-DEAL-2026-0002',
                    brandId: { brandName: 'VoltCharge EV Station' },
                    franchiseCity: 'Mohali',
                    franchiseUnitModel: 'FOCO',
                    investorId: { name: 'Rohit Sharma', phone: '+91 98888 12345' },
                    totalDealValueINR: 2500000,
                    calculatedCommissionINR: 75000,
                    totalInvoiceAmountINR: 88500,
                    status: 'INVOICED',
                    createdAt: new Date().toISOString(),
                  }
                ]).map((deal: any) => (
                  <tr key={deal._id} className="hover:bg-slate-950/40 transition-colors">
                    <td className="p-3 font-semibold text-white">
                      {deal.dealNumber}
                      <span className="block text-[10px] text-slate-500">{new Date(deal.createdAt).toLocaleDateString()}</span>
                    </td>
                    <td className="p-3">
                      <div className="font-bold text-slate-200">{deal.brandId?.brandName || 'Burger Blast'}</div>
                      <span className="text-[10px] text-blue-400">{deal.franchiseCity} ({deal.franchiseUnitModel})</span>
                    </td>
                    <td className="p-3 text-slate-300">
                      {deal.investorId?.name || 'Rohit Sharma'}
                      <span className="block text-[10px] text-slate-500">{deal.investorId?.phone || '+91 98888 12345'}</span>
                    </td>
                    <td className="p-3 font-bold text-emerald-400">
                      ₹{(deal.totalDealValueINR / 100000).toFixed(1)} Lakh
                    </td>
                    <td className="p-3 font-bold text-amber-400">
                      ₹{deal.calculatedCommissionINR.toLocaleString()}
                    </td>
                    <td className="p-3 font-semibold text-slate-200">
                      ₹{deal.totalInvoiceAmountINR.toLocaleString()}
                    </td>
                    <td className="p-3">
                      <span
                        className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                          deal.status === 'RECEIVED_SETTLED'
                            ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40'
                            : 'bg-amber-500/20 text-amber-300 border border-amber-500/40'
                        }`}
                      >
                        {deal.status}
                      </span>
                    </td>
                    <td className="p-3">
                      {deal.status !== 'RECEIVED_SETTLED' ? (
                        <button
                          onClick={() => handleSettleCommission(deal._id)}
                          className="px-2.5 py-1 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-[11px] transition-all"
                        >
                          Verify & Settle
                        </button>
                      ) : (
                        <span className="text-[11px] text-emerald-400 flex items-center gap-1 font-semibold">
                          <CheckCircle2 className="w-3.5 h-3.5" />
                          Settled
                        </span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Tab 2: Brand KYC Queue */}
      {activeTab === 'kyc' && (
        <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 space-y-4">
          <h3 className="text-base font-bold text-white font-['Outfit']">
            Brand KYC & Digital Booth Verification Queue
          </h3>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {brands.map((brand) => (
              <div
                key={brand._id}
                className="p-4 rounded-2xl bg-slate-950 border border-slate-800 flex flex-col justify-between space-y-3"
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-center gap-3">
                    <img
                      src={brand.logoUrl}
                      alt={brand.brandName}
                      className="w-12 h-12 rounded-xl object-cover border border-slate-700"
                    />
                    <div>
                      <h4 className="text-sm font-bold text-white flex items-center gap-1.5">
                        <span>{brand.brandName}</span>
                        {brand.verificationStatus === 'VERIFIED' && (
                          <CheckCircle2 className="w-3.5 h-3.5 text-blue-400" />
                        )}
                      </h4>
                      <p className="text-xs text-slate-400">
                        {brand.category} • {brand.investmentRange?.displayString} • {brand.businessModel}
                      </p>
                    </div>
                  </div>

                  <span
                    className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                      brand.verificationStatus === 'VERIFIED'
                        ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40'
                        : 'bg-amber-500/20 text-amber-300 border border-amber-500/40'
                    }`}
                  >
                    {brand.verificationStatus}
                  </span>
                </div>

                <p className="text-xs text-slate-400 line-clamp-2">{brand.description}</p>

                {/* Audit Actions */}
                <div className="flex items-center justify-between pt-2 border-t border-slate-800 text-xs">
                  <button
                    onClick={() => handleToggleFeature(brand._id, brand.isFeatured)}
                    className={`px-3 py-1 rounded-lg text-[11px] font-medium border ${
                      brand.isFeatured
                        ? 'bg-amber-500/20 border-amber-500/40 text-amber-300 font-bold'
                        : 'bg-slate-900 border-slate-700 text-slate-400'
                    }`}
                  >
                    {brand.isFeatured ? '★ Featured on Expo Floor' : '☆ Make Featured'}
                  </button>

                  <div className="flex gap-2">
                    {brand.verificationStatus !== 'VERIFIED' && (
                      <button
                        onClick={() => handleVerifyBrand(brand._id, 'VERIFIED')}
                        className="px-3 py-1 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-[11px]"
                      >
                        Approve & Verify
                      </button>
                    )}
                    {brand.verificationStatus === 'VERIFIED' && (
                      <button
                        onClick={() => handleVerifyBrand(brand._id, 'UNDER_REVIEW')}
                        className="px-3 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 text-[11px]"
                      >
                        Revoke Audit
                      </button>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Tab 3: Revenue Streams Breakdown */}
      {activeTab === 'revenue' && (
        <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 space-y-6">
          <h3 className="text-base font-bold text-white font-['Outfit']">
            VIZ Platform Revenue Breakdown
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 space-y-1">
              <span className="text-xs text-slate-400">Brand Subscriptions</span>
              <p className="text-xl font-bold text-purple-400">₹3,75,000</p>
              <p className="text-[10px] text-slate-500">Annual recurring booth plans</p>
            </div>

            <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 space-y-1">
              <span className="text-xs text-slate-400">3% Deal Success Fees</span>
              <p className="text-xl font-bold text-emerald-400">
                ₹{(overview?.stats?.totalCommissionEarnedINR || 165000).toLocaleString()}
              </p>
              <p className="text-[10px] text-slate-500">Performance deal commissions</p>
            </div>

            <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 space-y-1">
              <span className="text-xs text-slate-400">Featured & Premium Booths</span>
              <p className="text-xl font-bold text-amber-400">₹1,50,000</p>
              <p className="text-[10px] text-slate-500">Top placement & reels sponsor</p>
            </div>

            <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 space-y-1">
              <span className="text-xs text-slate-400">Investor Memberships</span>
              <p className="text-xl font-bold text-blue-400">₹45,000</p>
              <p className="text-[10px] text-slate-500">Premium AI & Priority access</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

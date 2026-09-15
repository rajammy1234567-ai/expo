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
      totalBrands: 0,
      verifiedBrands: 0,
      pendingBrands: 0,
      totalInvestors: 0,
      totalLeads: 0,
      totalMeetings: 0,
      totalDeals: 0,
      totalDealVolumeINR: 0,
      totalCommissionEarnedINR: 0,
      settledCommissionINR: 0,
      pendingCommissionINR: 0,
      revenueStreams: {
        brandSubscriptions: 0,
        dealSuccessFees: 0,
        premiumBooths: 0,
        investorMemberships: 0,
      },
    },
    recentDeals: [],
  });
  const [brands, setBrands] = useState<IBrand[]>([]);
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState<'commissions' | 'kyc' | 'revenue'>('commissions');
  const [kycFilter, setKycFilter] = useState<'ALL' | 'PENDING' | 'VERIFIED' | 'REJECTED'>('ALL');
  const [settlingDeal, setSettlingDeal] = useState<any | null>(null);
  const [bankRefInput, setBankRefInput] = useState('');
  const [statusMessage, setStatusMessage] = useState('');

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
      console.warn('Error loading admin data', err);
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
      setStatusMessage(`Brand status updated to ${status}`);
      setTimeout(() => setStatusMessage(''), 3000);
      loadAdminData();
    } catch (err: any) {
      console.error(err);
      alert(err.response?.data?.message || 'Error updating brand verification status');
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

  const handleUpdateDealStatus = async (dealId: string, status: string, refNo?: string) => {
    try {
      await adminApi.updateCommission(dealId, {
        status,
        paymentReferenceNo: refNo,
        bankSettlementRef: refNo,
        adminNotes: `Status updated to ${status} by VIZ Admin`,
      });
      setStatusMessage(`Deal status updated to ${status}`);
      setTimeout(() => setStatusMessage(''), 3000);
      setSettlingDeal(null);
      setBankRefInput('');
      loadAdminData();
    } catch (err: any) {
      console.error(err);
      alert(err.response?.data?.message || 'Failed to update deal status');
    }
  };

  const handleExportCSV = () => {
    const deals = overview?.recentDeals || [];
    if (deals.length === 0) {
      alert('No deal records to export.');
      return;
    }
    const headers = ['Deal ID', 'Date', 'Brand', 'City', 'Investor', 'Deal Value (INR)', '3% Fee (INR)', 'GST Amount (INR)', 'Total Invoice (INR)', 'Status', 'Settlement Ref'];
    const rows = deals.map((d: any) => [
      `"${d.dealNumber || ''}"`,
      `"${new Date(d.createdAt).toLocaleDateString()}"`,
      `"${(d.brandId?.brandName || '').replace(/"/g, '""')}"`,
      `"${d.franchiseCity || ''}"`,
      `"${(d.investorId?.name || '').replace(/"/g, '""')}"`,
      d.totalDealValueINR || 0,
      d.calculatedCommissionINR || 0,
      d.gstAmountINR || 0,
      d.totalInvoiceAmountINR || 0,
      `"${d.status || ''}"`,
      `"${d.paymentReferenceNo || d.bankSettlementRef || ''}"`
    ]);
    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map((row: any) => row.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `VIZ_Reconciliation_Ledger_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const filteredBrands = brands.filter((b) => {
    if (kycFilter === 'PENDING') return b.verificationStatus === 'PENDING_REVIEW' || b.verificationStatus === 'PENDING' || b.verificationStatus === 'UNDER_REVIEW';
    if (kycFilter === 'VERIFIED') return b.verificationStatus === 'VERIFIED';
    if (kycFilter === 'REJECTED') return b.verificationStatus === 'REJECTED';
    return true;
  });

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
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
            <div>
              <h3 className="text-base font-bold text-white font-['Outfit']">
                Franchise Deal Closure & 3% Commission Reconciliation
              </h3>
              <p className="text-xs text-slate-400">
                Agreed success fee formula: Total Deal Value × 3% + 18% GST (Calculated Server-Side)
              </p>
            </div>
            <button
              onClick={handleExportCSV}
              className="px-3.5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 hover:text-white font-bold text-xs flex items-center gap-2 border border-slate-700 shadow-sm transition-all"
            >
              <FileText className="w-3.5 h-3.5 text-amber-400" />
              <span>Export Ledger (.CSV)</span>
            </button>
          </div>

          {statusMessage && (
            <div className="p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 shrink-0" />
              <span>{statusMessage}</span>
            </div>
          )}

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
                  <th className="p-3">Bank Ref</th>
                  <th className="p-3">Settlement Status</th>
                  <th className="p-3">Transition Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60">
                {overview?.recentDeals?.length === 0 ? (
                  <tr>
                    <td colSpan={9} className="p-8 text-center text-slate-500 italic">
                      No deals recorded yet. When a Brand Admin closes a franchise deal, it will appear here for reconciliation.
                    </td>
                  </tr>
                ) : (
                  (overview?.recentDeals || []).map((deal: any) => (
                    <tr key={deal._id} className="hover:bg-slate-950/40 transition-colors">
                      <td className="p-3 font-semibold text-white">
                        {deal.dealNumber}
                        <span className="block text-[10px] text-slate-500">{new Date(deal.createdAt).toLocaleDateString()}</span>
                      </td>
                      <td className="p-3">
                        <div className="font-bold text-slate-200">{deal.brandId?.brandName || 'Brand Opportunity'}</div>
                        <span className="text-[10px] text-blue-400">{deal.franchiseCity} ({deal.franchiseUnitModel})</span>
                      </td>
                      <td className="p-3 text-slate-300">
                        {deal.investorId?.name || 'Investor'}
                        <span className="block text-[10px] text-slate-500">{deal.investorId?.phone || '—'}</span>
                      </td>
                      <td className="p-3 font-bold text-emerald-400">
                        ₹{((deal.totalDealValueINR || 0) / 100000).toFixed(1)} Lakh
                      </td>
                      <td className="p-3 font-bold text-amber-400">
                        ₹{(deal.calculatedCommissionINR || 0).toLocaleString()}
                      </td>
                      <td className="p-3 font-semibold text-slate-200">
                        ₹{(deal.totalInvoiceAmountINR || 0).toLocaleString()}
                      </td>
                      <td className="p-3 font-mono text-[11px] text-slate-400">
                        {deal.bankSettlementRef || deal.paymentReferenceNo || '—'}
                      </td>
                      <td className="p-3">
                        <span
                          className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                            deal.status === 'RECEIVED_SETTLED'
                              ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40'
                              : deal.status === 'INVOICE_SENT' || deal.status === 'INVOICED'
                              ? 'bg-blue-500/20 text-blue-300 border border-blue-500/40'
                              : 'bg-amber-500/20 text-amber-300 border border-amber-500/40'
                          }`}
                        >
                          {deal.status}
                        </span>
                      </td>
                      <td className="p-3">
                        <div className="flex items-center gap-1.5">
                          {(deal.status === 'PENDING_INVOICE' || !deal.status) && (
                            <button
                              onClick={() => handleUpdateDealStatus(deal._id, 'INVOICE_SENT')}
                              className="px-2.5 py-1 rounded-lg bg-blue-600 hover:bg-blue-500 text-white font-bold text-[10px] transition-all"
                            >
                              Send Invoice
                            </button>
                          )}

                          {(deal.status === 'INVOICE_SENT' || deal.status === 'INVOICED' || deal.status === 'PENDING_INVOICE') && (
                            <button
                              onClick={() => {
                                setSettlingDeal(deal);
                                setBankRefInput(`HDFC-CMS-${Math.floor(100000 + Math.random() * 900000)}`);
                              }}
                              className="px-2.5 py-1 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-[10px] transition-all"
                            >
                              Settle & Ref
                            </button>
                          )}

                          {deal.status === 'RECEIVED_SETTLED' && (
                            <span className="text-[10px] text-emerald-400 flex items-center gap-1 font-semibold">
                              <CheckCircle2 className="w-3.5 h-3.5" />
                              Settled
                            </span>
                          )}

                          {/* Quick manual selector */}
                          <select
                            value={deal.status}
                            onChange={(e) => handleUpdateDealStatus(deal._id, e.target.value)}
                            className="ml-1 bg-slate-950 border border-slate-700 text-slate-300 rounded px-1.5 py-0.5 text-[9px] focus:outline-none"
                          >
                            <option value="PENDING_INVOICE">Pending Invoice</option>
                            <option value="INVOICE_SENT">Invoice Sent</option>
                            <option value="RECEIVED_SETTLED">Received & Settled</option>
                          </select>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

          {/* Settlement Modal Dialog */}
          {settlingDeal && (
            <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4">
              <div className="bg-slate-900 border border-slate-700 rounded-2xl max-w-md w-full p-6 space-y-4 shadow-2xl">
                <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                  <h4 className="text-sm font-bold text-white flex items-center gap-2">
                    <DollarSign className="w-4 h-4 text-emerald-400" />
                    Record Settlement & Bank Reference
                  </h4>
                  <button
                    onClick={() => setSettlingDeal(null)}
                    className="text-slate-400 hover:text-white text-xs"
                  >
                    ✕
                  </button>
                </div>

                <div className="space-y-2 text-xs text-slate-300 bg-slate-950 p-3 rounded-xl border border-slate-800">
                  <div className="flex justify-between">
                    <span className="text-slate-500">Deal:</span>
                    <span className="font-semibold text-white">{settlingDeal.dealNumber}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-500">Brand:</span>
                    <span className="font-semibold text-white">{settlingDeal.brandId?.brandName || 'Brand'}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-500">Invoice Total (3% + 18% GST):</span>
                    <span className="font-bold text-emerald-400">₹{(settlingDeal.totalInvoiceAmountINR || 0).toLocaleString()}</span>
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">
                    Bank Settlement Reference Number
                  </label>
                  <input
                    type="text"
                    value={bankRefInput}
                    onChange={(e) => setBankRefInput(e.target.value)}
                    placeholder="e.g. HDFC-CMS-982142 or NEFT-098231"
                    className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-700 text-white text-xs focus:outline-none focus:border-emerald-500 font-mono"
                    required
                  />
                  <p className="text-[10px] text-slate-500 mt-1">
                    Enter the UTR or Bank Payment Gateway settlement transaction ID.
                  </p>
                </div>

                <div className="flex gap-2 pt-2">
                  <button
                    type="button"
                    onClick={() => setSettlingDeal(null)}
                    className="w-1/2 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 font-semibold text-xs"
                  >
                    Cancel
                  </button>
                  <button
                    type="button"
                    onClick={() => handleUpdateDealStatus(settlingDeal._id, 'RECEIVED_SETTLED', bankRefInput)}
                    className="w-1/2 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs shadow-lg shadow-emerald-500/20"
                  >
                    Confirm & Settle
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Tab 2: Brand KYC Queue */}
      {activeTab === 'kyc' && (
        <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 space-y-4">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
            <div>
              <h3 className="text-base font-bold text-white font-['Outfit']">
                Brand KYC & Digital Booth Verification Queue
              </h3>
              <p className="text-xs text-slate-400">
                Review newly submitted franchise profiles before granting public expo floor visibility.
              </p>
            </div>

            {/* Filter Pills */}
            <div className="flex items-center gap-1 bg-slate-950 p-1 rounded-xl border border-slate-800 text-xs">
              {(['ALL', 'PENDING', 'VERIFIED', 'REJECTED'] as const).map((filter) => (
                <button
                  key={filter}
                  onClick={() => setKycFilter(filter)}
                  className={`px-3 py-1 rounded-lg font-bold text-[11px] transition-all ${
                    kycFilter === filter
                      ? 'bg-amber-600 text-white shadow-sm'
                      : 'text-slate-400 hover:text-white'
                  }`}
                >
                  {filter === 'ALL'
                    ? `All (${brands.length})`
                    : filter === 'PENDING'
                    ? `Pending (${brands.filter((b) => b.verificationStatus === 'PENDING_REVIEW' || b.verificationStatus === 'PENDING' || b.verificationStatus === 'UNDER_REVIEW').length})`
                    : filter === 'VERIFIED'
                    ? `Verified (${brands.filter((b) => b.verificationStatus === 'VERIFIED').length})`
                    : `Rejected (${brands.filter((b) => b.verificationStatus === 'REJECTED').length})`}
                </button>
              ))}
            </div>
          </div>

          {statusMessage && (
            <div className="p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 shrink-0" />
              <span>{statusMessage}</span>
            </div>
          )}

          {filteredBrands.length === 0 ? (
            <div className="p-12 rounded-2xl bg-slate-950 border border-slate-800 text-center text-slate-500 text-xs">
              No brands matching the selected filter ({kycFilter}).
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {filteredBrands.map((brand) => (
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
                          : brand.verificationStatus === 'REJECTED'
                          ? 'bg-red-500/20 text-red-300 border border-red-500/40'
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
                      {brand.isFeatured ? '★ Featured on Expo' : '☆ Make Featured'}
                    </button>

                    <div className="flex gap-1.5">
                      {brand.verificationStatus !== 'VERIFIED' && (
                        <button
                          onClick={() => handleVerifyBrand(brand._id, 'VERIFIED')}
                          className="px-3 py-1 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-[11px] shadow-sm transition-all"
                        >
                          ✓ Approve
                        </button>
                      )}
                      {brand.verificationStatus !== 'REJECTED' && (
                        <button
                          onClick={() => handleVerifyBrand(brand._id, 'REJECTED')}
                          className="px-3 py-1 rounded-lg bg-red-950/60 hover:bg-red-900 border border-red-500/40 text-red-300 font-bold text-[11px] transition-all"
                        >
                          ✕ Reject
                        </button>
                      )}
                      {brand.verificationStatus === 'VERIFIED' && (
                        <button
                          onClick={() => handleVerifyBrand(brand._id, 'PENDING_REVIEW')}
                          className="px-2.5 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 text-[11px]"
                        >
                          Revoke
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
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

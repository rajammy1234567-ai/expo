import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { IBrand, ILead, IDealCommission } from '../types';
import { brandApi, leadApi, dealApi } from '../services/api';
import { CreateFranchiseModal } from '../components/CreateFranchiseModal';
import { CreateDealModal } from '../components/CreateDealModal';
import { ChatModal } from '../components/ChatModal';
import {
  Users,
  Calendar,
  DollarSign,
  TrendingUp,
  Building2,
  CheckCircle2,
  Clock,
  ArrowRight,
  Plus,
  Edit3,
  Video,
  FileCheck,
  Award,
  MessageSquare,
  Sparkles,
} from 'lucide-react';

export const BrandPortalView: React.FC = () => {
  const { user } = useAuth();
  const [brand, setBrand] = useState<IBrand | null>(null);
  const [myBrands, setMyBrands] = useState<IBrand[]>([]);
  const [leads, setLeads] = useState<ILead[]>([]);
  const [deals, setDeals] = useState<IDealCommission[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'pipeline' | 'my-brands' | 'deals'>('pipeline');

  // Modals state
  const [showCreateFranchise, setShowCreateFranchise] = useState(false);
  const [showCreateDeal, setShowCreateDeal] = useState(false);
  const [chatTargetLead, setChatTargetLead] = useState<ILead | null>(null);

  const loadBrandData = async () => {
    setLoading(true);
    try {
      const bRes = await brandApi.getBrands({ verifiedOnly: 'false' });
      if (bRes.data.success && bRes.data.brands.length > 0) {
        const userBrand = bRes.data.brands.find((b: IBrand) => b._id === user?.brandId) || bRes.data.brands[0];
        setBrand(userBrand);
        setMyBrands(bRes.data.brands.filter((b: IBrand) => b.ownerUserId === user?._id || b._id === user?.brandId));

        const [lRes, dRes] = await Promise.all([
          leadApi.getBrandLeads(userBrand._id).catch(() => ({ data: { leads: [] } })),
          dealApi.getBrandDeals(userBrand._id).catch(() => ({ data: { deals: [] } })),
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

  const pipelineColumns = [
    { id: 'NEW', title: 'New Leads', color: 'border-blue-500' },
    { id: 'CONTACTED', title: 'Contacted / Chat', color: 'border-cyan-500' },
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
                {brand?.brandName || 'Chai Shai Express'}
              </h1>
              <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-purple-500/20 text-purple-300 border border-purple-500/40">
                Verified Franchisor Partner
              </span>
            </div>
            <p className="text-xs text-slate-300 mt-0.5">
              Live Expo Booth Floor CRM & Deal Pipeline Engine
            </p>
          </div>
        </div>

        {/* Action Buttons: Add Franchise & Record Deal */}
        <div className="flex flex-wrap items-center gap-3">
          <button
            type="button"
            onClick={() => setShowCreateFranchise(true)}
            className="px-4 py-2.5 rounded-xl bg-purple-600 hover:bg-purple-500 text-white font-bold text-xs flex items-center gap-2 shadow-lg shadow-purple-600/25 transition-all"
          >
            <Plus className="w-4 h-4" />
            <span>+ Add New Franchise Booth</span>
          </button>

          <button
            type="button"
            onClick={() => setShowCreateDeal(true)}
            className="px-4 py-2.5 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-400 hover:to-teal-500 text-slate-950 font-bold text-xs flex items-center gap-2 shadow-lg shadow-emerald-500/20 transition-all"
          >
            <Award className="w-4 h-4" />
            <span>Record Closed Franchise Deal</span>
          </button>
        </div>
      </div>

      {/* Metrics Row */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="p-4 rounded-2xl bg-slate-900 border border-slate-800 space-y-1">
          <span className="text-xs text-slate-400 flex items-center gap-1">
            <Users className="w-3.5 h-3.5 text-blue-400" />
            Total Inquiries
          </span>
          <p className="text-2xl font-black text-white">{leads.length}</p>
          <span className="text-[10px] text-slate-400 font-semibold">Active investor leads</span>
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
          { id: 'my-brands', label: `My Franchise Listings (${myBrands.length || 1})` },
          { id: 'deals', label: `Closed Deals & Invoices (${deals.length})` },
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
              <div
                key={col.id}
                onDragOver={(e) => {
                  e.preventDefault();
                  e.dataTransfer.dropEffect = 'move';
                }}
                onDrop={(e) => {
                  e.preventDefault();
                  const leadId = e.dataTransfer.getData('text/plain');
                  if (leadId) {
                    handleStageChange(leadId, col.id);
                  }
                }}
                className="bg-slate-900/70 border border-slate-800 rounded-2xl p-3 space-y-3 min-w-[240px] transition-colors hover:border-purple-500/40"
              >
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
                        draggable={true}
                        onDragStart={(e) => {
                          e.dataTransfer.setData('text/plain', lead._id);
                          e.dataTransfer.effectAllowed = 'move';
                        }}
                        className="p-3 rounded-xl bg-slate-950 border border-slate-800/80 hover:border-purple-500/50 transition-all space-y-2 shadow-sm cursor-grab active:cursor-grabbing"
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

                        {/* Direct Chat with Investor Button */}
                        <button
                          type="button"
                          onClick={() => setChatTargetLead(lead)}
                          className="w-full py-1.5 px-2 rounded-lg bg-blue-600/20 hover:bg-blue-600/30 border border-blue-500/30 text-blue-300 hover:text-white text-[10px] font-semibold flex items-center justify-center gap-1.5 transition-colors"
                        >
                          <MessageSquare className="w-3 h-3 text-blue-400" />
                          <span>Direct Message Investor</span>
                        </button>

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

      {/* My Franchise Listings Tab */}
      {activeTab === 'my-brands' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="font-bold text-white text-base">Your Active Franchise Booths</h3>
            <button
              onClick={() => setShowCreateFranchise(true)}
              className="px-3.5 py-1.5 rounded-xl bg-purple-600 hover:bg-purple-500 text-white font-bold text-xs flex items-center gap-1.5"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Add Another Franchise</span>
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {(myBrands.length > 0 ? myBrands : [brand]).filter(Boolean).map((b: any) => (
              <div
                key={b._id}
                className="p-5 rounded-2xl bg-slate-900 border border-slate-800 space-y-3"
              >
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-3">
                    <img
                      src={b.logoUrl}
                      alt={b.brandName}
                      className="w-12 h-12 rounded-xl object-cover border border-slate-700"
                    />
                    <div>
                      <h4 className="text-sm font-bold text-white">{b.brandName}</h4>
                      <span className="text-[10px] text-slate-400">{b.category} • {b.businessModel}</span>
                    </div>
                  </div>
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                    {b.verificationStatus || 'VERIFIED'}
                  </span>
                </div>

                <p className="text-xs text-slate-400 line-clamp-2">{b.tagline || b.description}</p>

                <div className="pt-2 border-t border-slate-800/80 flex items-center justify-between text-xs">
                  <span className="text-slate-400">Investment:</span>
                  <span className="font-bold text-amber-400">{b.investmentRange?.displayString}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Closed Deals View */}
      {activeTab === 'deals' && (
        <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="font-bold text-white text-base">Closed Deals & VIZ 3% Commission Status</h3>
            <button
              onClick={() => setShowCreateDeal(true)}
              className="px-3.5 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-slate-950 font-bold text-xs flex items-center gap-1.5"
            >
              <Award className="w-3.5 h-3.5" />
              <span>Record New Deal</span>
            </button>
          </div>

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

      {/* Create Franchise Booth Modal */}
      <CreateFranchiseModal
        isOpen={showCreateFranchise}
        onClose={() => setShowCreateFranchise(false)}
        onCreated={loadBrandData}
      />

      {/* Record Closed Deal Multi-Step Modal */}
      <CreateDealModal
        isOpen={showCreateDeal}
        onClose={() => setShowCreateDeal(false)}
        brand={brand}
        leads={leads}
        onDealRecorded={loadBrandData}
      />

      {/* Direct Chat with Lead Modal */}
      {chatTargetLead && (
        <ChatModal
          isOpen={!!chatTargetLead}
          onClose={() => setChatTargetLead(null)}
          targetUserId={
            (chatTargetLead.investorId as any)?._id ||
            (chatTargetLead.investorId as any) ||
            '65e100000000000000000001'
          }
          targetUserName={chatTargetLead.investorSnapshot?.name || 'Investor'}
          brand={brand}
        />
      )}
    </div>
  );
};

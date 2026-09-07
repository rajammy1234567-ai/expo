import React, { useState, useEffect } from 'react';
import { IBrand, IKnowledgeBaseItem } from '../types';
import { brandApi, leadApi } from '../services/api';
import {
  Sparkles,
  Calendar,
  Download,
  CheckCircle2,
  Building,
  MapPin,
  IndianRupee,
  Layers,
  Clock,
  ShieldCheck,
  Phone,
  ArrowLeft,
  X,
  FileText,
  HelpCircle,
  Image,
} from 'lucide-react';

interface BrandDetailViewProps {
  brand: IBrand;
  onBack: () => void;
  onOpenAI: (brand: IBrand) => void;
  onOpenMeeting: (brand: IBrand) => void;
}

export const BrandDetailView: React.FC<BrandDetailViewProps> = ({
  brand,
  onBack,
  onOpenAI,
  onOpenMeeting,
}) => {
  const [activeTab, setActiveTab] = useState<'overview' | 'financials' | 'support' | 'faq' | 'gallery'>('overview');
  const [knowledgeBase, setKnowledgeBase] = useState<IKnowledgeBaseItem[]>([]);
  const [downloading, setDownloading] = useState(false);

  useEffect(() => {
    const fetchFullDetails = async () => {
      try {
        const res = await brandApi.getBrandById(brand._id);
        if (res.data.success && res.data.knowledgeBase) {
          setKnowledgeBase(res.data.knowledgeBase);
        }
      } catch (err) {
        console.error('Error fetching brand details', err);
      }
    };
    fetchFullDetails();
  }, [brand._id]);

  const handleDownloadBrochure = async () => {
    setDownloading(true);
    try {
      await leadApi.createLead(brand._id, 'BROCHURE_DOWNLOAD', 'Downloaded official investor dossier');
      alert(`Brochure for ${brand.brandName} downloaded! Our team will share the complete deck over WhatsApp as well.`);
    } catch (err) {
      console.error(err);
    } finally {
      setDownloading(false);
    }
  };

  return (
    <div className="space-y-6 pb-24">
      {/* Top Back Navigation */}
      <button
        onClick={onBack}
        className="px-3 py-1.5 rounded-xl bg-slate-900 hover:bg-slate-800 border border-slate-700 text-slate-300 hover:text-white text-xs font-medium flex items-center gap-1.5 transition-all"
      >
        <ArrowLeft className="w-3.5 h-3.5" />
        <span>Back to Expo Floor</span>
      </button>

      {/* Digital Booth Header Card */}
      <div className="relative rounded-3xl overflow-hidden bg-slate-900 border border-slate-800 shadow-2xl">
        {/* Banner / Pitch Video Player */}
        <div className="relative aspect-[21/9] sm:aspect-[24/9] w-full bg-slate-950 overflow-hidden">
          {brand.pitchVideoUrl ? (
            <video
              src={brand.pitchVideoUrl}
              poster={brand.bannerUrl}
              controls
              playsInline
              className="w-full h-full object-cover"
            />
          ) : (
            <img
              src={brand.bannerUrl || brand.logoUrl}
              alt={brand.brandName}
              className="w-full h-full object-cover"
            />
          )}
          <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-transparent to-transparent pointer-events-none"></div>
        </div>

        {/* Booth Info Bar */}
        <div className="p-6 sm:p-8 flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
          <div className="flex items-center gap-4">
            <img
              src={brand.logoUrl}
              alt={brand.brandName}
              className="w-16 h-16 sm:w-20 sm:h-20 rounded-2xl object-cover border-2 border-blue-500/50 shadow-xl bg-slate-900 shrink-0"
            />
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight font-['Outfit']">
                  {brand.brandName}
                </h1>
                {brand.verificationStatus === 'VERIFIED' && (
                  <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-bold bg-blue-500/20 text-blue-400 border border-blue-500/30">
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    <span>Verified Booth</span>
                  </span>
                )}
                <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-amber-500/20 text-amber-300 border border-amber-500/30">
                  {brand.businessModel} Model
                </span>
              </div>
              <p className="text-sm text-slate-300 mt-1">{brand.tagline}</p>
              <p className="text-xs text-slate-400 mt-0.5">
                Category: <strong className="text-slate-200">{brand.category}</strong> • Est. {brand.yearEstablished} • {brand.existingOutletsCount} Active Outlets
              </p>
            </div>
          </div>

          {/* Quick Metrics Pills */}
          <div className="grid grid-cols-3 gap-3 w-full md:w-auto bg-slate-950/80 p-3 rounded-2xl border border-slate-800 text-center">
            <div className="px-3">
              <span className="text-[10px] text-slate-400 uppercase tracking-wider block">Investment</span>
              <span className="text-sm font-bold text-emerald-400">{brand.investmentRange.displayString}</span>
            </div>
            <div className="px-3 border-x border-slate-800">
              <span className="text-[10px] text-slate-400 uppercase tracking-wider block">Required Space</span>
              <span className="text-sm font-bold text-slate-200">{brand.requiredAreaSqFt.displayString}</span>
            </div>
            <div className="px-3">
              <span className="text-[10px] text-slate-400 uppercase tracking-wider block">Payback</span>
              <span className="text-sm font-bold text-amber-400">
                {brand.estimatedROIHistoricalMonths.min}–{brand.estimatedROIHistoricalMonths.max} Mo*
              </span>
            </div>
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="px-6 sm:px-8 border-t border-slate-800 flex items-center gap-2 overflow-x-auto no-scrollbar">
          {[
            { id: 'overview', label: 'Overview', icon: Building },
            { id: 'financials', label: 'Financials & FOFO Model', icon: IndianRupee },
            { id: 'support', label: 'Brand Support & SOPs', icon: ShieldCheck },
            { id: 'faq', label: `Approved FAQs (${knowledgeBase.length})`, icon: HelpCircle },
            { id: 'gallery', label: 'Gallery', icon: Image },
          ].map((tab) => {
            const Icon = tab.icon;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`py-3.5 px-4 text-xs font-semibold border-b-2 flex items-center gap-2 transition-all whitespace-nowrap ${
                  activeTab === tab.id
                    ? 'border-blue-500 text-blue-400 bg-blue-500/5'
                    : 'border-transparent text-slate-400 hover:text-slate-200'
                }`}
              >
                <Icon className="w-3.5 h-3.5" />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Tab Panels */}
      <div className="bg-slate-900 rounded-3xl p-6 sm:p-8 border border-slate-800 shadow-xl space-y-6">
        {activeTab === 'overview' && (
          <div className="space-y-6">
            <div>
              <h3 className="text-base font-bold text-white mb-2 font-['Outfit']">About {brand.brandName}</h3>
              <p className="text-sm text-slate-300 leading-relaxed">{brand.description}</p>
            </div>

            <div>
              <h3 className="text-base font-bold text-white mb-3 font-['Outfit']">Target Expansion Cities</h3>
              <div className="flex flex-wrap gap-2">
                {brand.targetExpansionCities.map((city, i) => (
                  <span
                    key={i}
                    className="px-3 py-1.5 rounded-xl bg-slate-950 border border-slate-800 text-xs font-medium text-slate-300 flex items-center gap-1"
                  >
                    <MapPin className="w-3 h-3 text-blue-400" />
                    <span>{city}</span>
                  </span>
                ))}
              </div>
            </div>
          </div>
        )}

        {activeTab === 'financials' && (
          <div className="space-y-6">
            <h3 className="text-base font-bold text-white font-['Outfit']">Unit Economics & Commercial Breakup</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 space-y-1">
                <span className="text-xs text-slate-400">Total Setup Investment</span>
                <p className="text-lg font-bold text-emerald-400">{brand.investmentRange.displayString}</p>
                <p className="text-[11px] text-slate-500">Includes machinery, fitout & initial working capital</p>
              </div>

              <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 space-y-1">
                <span className="text-xs text-slate-400">Brand Franchise Fee</span>
                <p className="text-lg font-bold text-white">₹{(brand.franchiseFeeINR / 100000).toFixed(1)} Lakh</p>
                <p className="text-[11px] text-slate-500">One-time brand onboarding & training</p>
              </div>

              <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 space-y-1">
                <span className="text-xs text-slate-400">Royalty / Revenue Share</span>
                <p className="text-lg font-bold text-blue-400">{brand.royaltyPercentage}% Monthly</p>
                <p className="text-[11px] text-slate-500">Includes software & ongoing marketing</p>
              </div>

              <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 space-y-1">
                <span className="text-xs text-slate-400">Operating Model</span>
                <p className="text-lg font-bold text-amber-300">{brand.businessModel}</p>
                <p className="text-[11px] text-slate-500">
                  {brand.businessModel === 'FOFO' ? 'Franchise Owned, Franchise Operated' : 'Franchise Owned, Company Operated'}
                </p>
              </div>

              <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 space-y-1 sm:col-span-2">
                <span className="text-xs text-slate-400">Estimated Payback Period</span>
                <p className="text-lg font-bold text-amber-400">
                  {brand.estimatedROIHistoricalMonths.min} to {brand.estimatedROIHistoricalMonths.max} Months*
                </p>
                <p className="text-[11px] text-amber-300/80 italic">
                  *Disclaimer: {brand.estimatedROIHistoricalMonths.disclaimer}
                </p>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'support' && (
          <div className="space-y-6">
            <h3 className="text-base font-bold text-white font-['Outfit']">End-to-End Brand Support Matrix</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {[
                { title: 'Site Selection & Territory Audit', enabled: brand.supportOffered?.siteSelection, desc: 'Demographic analysis, footfall tracking & lease negotiation assistance.' },
                { title: 'Staff Recruitment & Comprehensive Training', enabled: brand.supportOffered?.staffTraining, desc: 'Master chef / technician SOPs and hospitality training modules.' },
                { title: 'National & Hyperlocal Marketing', enabled: brand.supportOffered?.marketingSupport, desc: 'Zomato/Swiggy/Google Ads brand presence and launch marketing.' },
                { title: 'Turnkey Interior Architecture Setup', enabled: brand.supportOffered?.interiorSetup, desc: '3D layout drawings, equipment vendor sourcing & turnkey setup.' },
                { title: 'Raw Material & Supply Chain', enabled: brand.supportOffered?.rawMaterialSupply, desc: 'Central kitchen batching & refrigerated logistics dispatch.' },
                { title: 'Cloud POS & ERP Billing Software', enabled: brand.supportOffered?.softwareBillingPOS, desc: 'Realtime inventory tracker, automated GST billing & franchisee portal.' },
              ].map((item, idx) => (
                <div key={idx} className="p-4 rounded-2xl bg-slate-950 border border-slate-800 flex items-start gap-3">
                  <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0 mt-0.5" />
                  <div>
                    <h4 className="text-xs font-bold text-white">{item.title}</h4>
                    <p className="text-[11px] text-slate-400 mt-0.5">{item.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {activeTab === 'faq' && (
          <div className="space-y-4">
            <h3 className="text-base font-bold text-white font-['Outfit']">Brand Approved Questions & Answers</h3>
            {knowledgeBase.length === 0 ? (
              <p className="text-xs text-slate-400">No FAQs uploaded yet.</p>
            ) : (
              <div className="space-y-3">
                {knowledgeBase.map((kb) => (
                  <div key={kb._id} className="p-4 rounded-2xl bg-slate-950 border border-slate-800 space-y-1.5">
                    <p className="text-xs font-bold text-blue-300">Q: {kb.question || kb.title}</p>
                    <p className="text-xs text-slate-300 leading-relaxed">A: {kb.answer || kb.content}</p>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {activeTab === 'gallery' && (
          <div className="space-y-4">
            <h3 className="text-base font-bold text-white font-['Outfit']">Outlet Showcase & Gallery</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
              {brand.galleryUrls && brand.galleryUrls.length > 0 ? (
                brand.galleryUrls.map((img, i) => (
                  <img
                    key={i}
                    src={img}
                    alt={`Gallery ${i + 1}`}
                    className="w-full h-48 rounded-2xl object-cover border border-slate-800"
                  />
                ))
              ) : (
                <p className="text-xs text-slate-400">No gallery photos added yet.</p>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Sticky Bottom Action Dock */}
      <div className="fixed bottom-0 left-0 right-0 z-40 bg-slate-950/90 backdrop-blur-xl border-t border-slate-800 p-4 shadow-2xl">
        <div className="max-w-7xl mx-auto flex flex-wrap items-center justify-between gap-3">
          <div className="hidden sm:flex items-center gap-3">
            <img src={brand.logoUrl} alt={brand.brandName} className="w-10 h-10 rounded-xl object-cover" />
            <div>
              <p className="text-xs font-bold text-white">{brand.brandName}</p>
              <p className="text-[11px] text-emerald-400 font-semibold">{brand.investmentRange.displayString} • {brand.businessModel}</p>
            </div>
          </div>

          <div className="flex items-center gap-3 w-full sm:w-auto">
            <button
              onClick={() => onOpenAI(brand)}
              className="flex-1 sm:flex-none py-2.5 px-4 rounded-xl bg-blue-600/20 hover:bg-blue-600/30 border border-blue-500/40 text-blue-300 hover:text-white text-xs font-bold flex items-center justify-center gap-2 transition-all"
            >
              <Sparkles className="w-4 h-4 text-blue-400" />
              <span>Ask AI Bot</span>
            </button>

            <button
              onClick={() => onOpenMeeting(brand)}
              className="flex-1 sm:flex-none py-2.5 px-5 rounded-xl bg-gradient-to-r from-amber-500 to-orange-600 hover:from-amber-400 hover:to-orange-500 text-slate-950 text-xs font-extrabold flex items-center justify-center gap-2 shadow-lg shadow-orange-500/20 transition-all"
            >
              <Calendar className="w-4 h-4" />
              <span>Request Live Discovery Call</span>
            </button>

            <button
              onClick={handleDownloadBrochure}
              disabled={downloading}
              className="py-2.5 px-3 rounded-xl bg-slate-900 hover:bg-slate-800 border border-slate-700 text-slate-300 text-xs font-medium flex items-center justify-center gap-1.5 transition-all"
            >
              <Download className="w-3.5 h-3.5" />
              <span className="hidden md:inline">{downloading ? 'Downloading...' : 'Brochure'}</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

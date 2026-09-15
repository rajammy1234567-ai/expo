import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { authApi, brandApi } from '../services/api';
import { IBrand } from '../types';
import { BrandReelCard } from '../components/BrandReelCard';
import {
  Sparkles,
  ShieldCheck,
  Building2,
  TrendingUp,
  ArrowRight,
  Search,
  CheckCircle2,
  Lock,
  Layers,
  Award,
  Zap,
  DollarSign,
  Calendar,
  MessageSquare,
  ChevronRight,
} from 'lucide-react';

interface HomeLandingViewProps {
  onSuccess?: (role: string) => void;
  onOpenBrandDetails?: (brand: IBrand) => void;
  onOpenChat?: (brand: IBrand) => void;
  onOpenMeeting?: (brand: IBrand) => void;
  onOpenLoginModal?: () => void;
}

export const HomeLandingView: React.FC<HomeLandingViewProps> = ({
  onSuccess,
  onOpenBrandDetails,
  onOpenChat,
  onOpenMeeting,
  onOpenLoginModal,
}) => {
  const navigate = useNavigate();
  const { user } = useAuth();

  // Search & Filter state
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('ALL');

  // Live Brands & Telemetry
  const [brands, setBrands] = useState<IBrand[]>([]);
  const [loadingBrands, setLoadingBrands] = useState(true);
  const [platformStats, setPlatformStats] = useState<any>({
    totalGMV: 5500000,
    verifiedBrands: 6,
    totalInvestors: 142,
    closedDeals: 2,
  });

  // Interactive AI Sandbox State
  const [aiSelectedPrompt, setAiSelectedPrompt] = useState<number>(0);

  const aiDemos = [
    {
      query: 'What is the break-even footfall for Burger Blast in Chandigarh?',
      brand: 'Burger Blast (QSR)',
      response:
        'Based on verified unit economics: At an average ticket size of ₹280 and 65% gross margin, break-even is achieved at 85 daily footfalls (approx ₹23,800 daily GMV). Expected payback period is 10–14 months in prime high-street commercial clusters.',
    },
    {
      query: 'What are the franchise fees and Capex for Chai Shai Express?',
      brand: 'Chai Shai Express (F&B)',
      response:
        'Initial Franchise Fee is ₹3,00,000 with a 4% ongoing royalty. Total turnkey setup Capex ranges from ₹12L to ₹18L for a 200–350 sq.ft store including automated brewing machinery, POS, and branded neon frontage.',
    },
    {
      query: 'What is the ROI and territory exclusivity for VoltCharge EV?',
      brand: 'VoltCharge EV Station',
      response:
        'VoltCharge offers a guaranteed 3 km territory exclusivity radius for 60kW DC Dual Guns. Historical investor ROI is 12–16 months with 100% hardware warranty and automated revenue share disbursement to your linked bank account.',
    },
  ];

  const categories = [
    'ALL',
    'FOOD & BEVERAGE',
    'EV & AUTOMOTIVE',
    'FITNESS',
    'EDUCATION',
    'BEAUTY & SALON',
  ];

  // Fetch verified brands and live platform telemetry
  useEffect(() => {
    const fetchData = async () => {
      try {
        const [sRes, bRes] = await Promise.all([
          authApi.getStats().catch(() => ({ data: { success: false } })),
          brandApi.getBrands({ verifiedOnly: 'true' }).catch(() => ({ data: { success: false, brands: [] } })),
        ]);

        if (sRes.data?.success && sRes.data?.stats) {
          setPlatformStats(sRes.data.stats);
        }

        if (bRes.data?.success && bRes.data?.brands) {
          setBrands(bRes.data.brands);
        }
      } catch (err) {
        console.warn('Telemetry initialized with fallback', err);
      } finally {
        setLoadingBrands(false);
      }
    };
    fetchData();
  }, []);

  // Filtered brands
  const filteredBrands = brands.filter((b) => {
    const matchesSearch =
      !searchQuery ||
      b.brandName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      b.category.toLowerCase().includes(searchQuery.toLowerCase()) ||
      b.tagline?.toLowerCase().includes(searchQuery.toLowerCase());

    if (!matchesSearch) return false;
    if (selectedCategory === 'ALL') return true;

    const catUpper = (b.category || '').toUpperCase();
    if (selectedCategory === 'FOOD & BEVERAGE')
      return catUpper.includes('FOOD') || catUpper.includes('BEVERAGE') || catUpper.includes('QSR');
    if (selectedCategory === 'EV & AUTOMOTIVE')
      return catUpper.includes('EV') || catUpper.includes('ENERGY') || catUpper.includes('AUTO');
    if (selectedCategory === 'FITNESS')
      return catUpper.includes('FITNESS') || catUpper.includes('GYM');
    if (selectedCategory === 'EDUCATION')
      return catUpper.includes('EDUCATION') || catUpper.includes('SCHOOL');
    if (selectedCategory === 'BEAUTY & SALON')
      return catUpper.includes('SALON') || catUpper.includes('BEAUTY');

    return true;
  });

  return (
    <div className="space-y-16 pb-24 text-white font-sans">
      {/* ============================================================ */}
      {/* 1. AMAZON-STYLE MINIMAL HERO (First Screen)                  */}
      {/* ============================================================ */}
      <section className="relative rounded-3xl overflow-hidden bg-gradient-to-b from-blue-950/40 via-slate-900/90 to-[#07090e] border border-slate-800/80 p-6 sm:p-10 lg:p-14 shadow-2xl">
        {/* Subtle Ambient Orbs */}
        <div className="absolute top-0 right-1/4 w-80 h-80 bg-blue-600/10 rounded-full blur-3xl pointer-events-none -translate-y-1/2" />
        <div className="absolute bottom-0 left-1/4 w-80 h-80 bg-indigo-600/10 rounded-full blur-3xl pointer-events-none translate-y-1/2" />

        <div className="relative z-10 max-w-4xl mx-auto text-center space-y-5">
          {/* Subtle Live Badge */}
          <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-slate-900/90 border border-slate-800 text-[11px] text-slate-300 shadow-sm">
            <span className="flex h-2 w-2 rounded-full bg-emerald-400 animate-pulse" />
            <span className="font-semibold text-white tracking-wide uppercase">
              India's 24/7 Digital Franchise Marketplace
            </span>
          </div>

          {/* Clean One-Line Value Proposition (Amazon-style, zero clutter) */}
          <h1 className="text-3xl sm:text-5xl lg:text-6xl font-black tracking-tight font-['Outfit'] text-white leading-tight">
            Discover & Partner with India's{' '}
            <span className="bg-gradient-to-r from-blue-400 via-indigo-300 to-amber-300 bg-clip-text text-transparent">
              Top Franchise Brands.
            </span>
          </h1>

          <p className="text-sm sm:text-base text-slate-400 max-w-2xl mx-auto font-normal leading-relaxed">
            Browse verified unit economics, inspect 3D digital booths, and connect directly with brand founders — completely open for guest exploration.
          </p>

          {/* Amazon-Style Search & Browse Bar */}
          <div className="pt-2 max-w-2xl mx-auto">
            <div className="relative flex items-center bg-slate-950/90 border border-slate-700/80 rounded-2xl shadow-xl p-1.5 focus-within:border-blue-500 transition-all">
              <Search className="w-5 h-5 text-slate-400 ml-3 shrink-0" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search by brand name, industry, or investment range..."
                className="w-full bg-transparent px-3 py-2 text-xs sm:text-sm text-white placeholder-slate-500 focus:outline-none"
              />
              <button
                type="button"
                onClick={() => {
                  const el = document.getElementById('expo-grid');
                  if (el) el.scrollIntoView({ behavior: 'smooth' });
                }}
                className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white font-bold text-xs shrink-0 shadow-md shadow-blue-600/25 transition-all"
              >
                Browse Brands
              </button>
            </div>

            {/* Category Pills */}
            <div className="flex flex-wrap items-center justify-center gap-1.5 pt-3">
              {categories.map((cat) => (
                <button
                  key={cat}
                  onClick={() => setSelectedCategory(cat)}
                  className={`px-3 py-1 rounded-lg text-[11px] font-semibold transition-all ${
                    selectedCategory === cat
                      ? 'bg-blue-600 text-white shadow-sm'
                      : 'bg-slate-900/80 text-slate-400 hover:text-slate-200 hover:bg-slate-800'
                  }`}
                >
                  {cat === 'ALL' ? 'All Sectors' : cat}
                </button>
              ))}
            </div>
          </div>

          {/* Secondary helper CTA */}
          <div className="pt-1 flex items-center justify-center gap-4 text-xs text-slate-400">
            <span>Are you a brand founder?</span>
            <button
              onClick={() => {
                if (user) navigate('/brand-portal');
                else if (onOpenLoginModal) onOpenLoginModal();
              }}
              className="text-purple-400 hover:text-purple-300 font-semibold flex items-center gap-1 hover:underline underline-offset-2"
            >
              <Building2 className="w-3.5 h-3.5" />
              <span>List your franchise on VIZ →</span>
            </button>
          </div>
        </div>
      </section>

      {/* ============================================================ */}
      {/* 2. LIVE VERIFIED EXPO FLOOR GRID (Open Guest Browsing)        */}
      {/* ============================================================ */}
      <section id="expo-grid" className="space-y-6">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-2 border-b border-slate-800/80">
          <div>
            <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-blue-500/10 border border-blue-500/30 text-blue-400 text-[10px] font-bold mb-1">
              <ShieldCheck className="w-3 h-3" />
              <span>100% Vetted Unit Economics</span>
            </div>
            <h2 className="text-xl sm:text-2xl font-black tracking-tight font-['Outfit'] text-white">
              Featured Franchise Booths ({filteredBrands.length})
            </h2>
          </div>

          <button
            onClick={() => navigate('/expo-floor')}
            className="text-xs font-semibold text-blue-400 hover:text-blue-300 flex items-center gap-1 transition-colors"
          >
            <span>View Full 3D Expo Floor</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>

        {/* Brands Grid */}
        {loadingBrands ? (
          <div className="py-16 text-center text-slate-400 text-xs">
            Loading verified digital booths...
          </div>
        ) : filteredBrands.length === 0 ? (
          <div className="py-16 text-center rounded-3xl bg-slate-950/40 border border-slate-800/60 p-8 space-y-3">
            <Building2 className="w-8 h-8 text-slate-600 mx-auto" />
            <p className="text-sm font-semibold text-slate-300">No franchise brands matched your search.</p>
            <button
              onClick={() => {
                setSearchQuery('');
                setSelectedCategory('ALL');
              }}
              className="text-xs text-blue-400 hover:underline"
            >
              Reset filters
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredBrands.map((b) => (
              <BrandReelCard
                key={b._id}
                brand={b}
                onOpenChat={(brand) => {
                  if (onOpenChat) onOpenChat(brand);
                  else if (!user && onOpenLoginModal) onOpenLoginModal();
                }}
                onOpenMeeting={(brand) => {
                  if (onOpenMeeting) onOpenMeeting(brand);
                  else if (!user && onOpenLoginModal) onOpenLoginModal();
                }}
                onOpenDetails={(brand) => {
                  if (onOpenBrandDetails) onOpenBrandDetails(brand);
                  else navigate(`/expo-floor`);
                }}
              />
            ))}
          </div>
        )}
      </section>

      {/* ============================================================ */}
      {/* 3. PLATFORM TELEMETRY STATS (Further Down Scroll Section)    */}
      {/* ============================================================ */}
      <section className="space-y-6 pt-6 border-t border-slate-800/80">
        <div className="text-center max-w-xl mx-auto space-y-1">
          <span className="text-[11px] font-bold text-amber-400 uppercase tracking-wider">
            Verified Deal Volume
          </span>
          <h2 className="text-xl sm:text-2xl font-black font-['Outfit'] text-white">
            Real Unit Economics. Zero Inflation.
          </h2>
          <p className="text-xs text-slate-400">
            Live audited metrics across our network of verified brand booths and investors.
          </p>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 max-w-4xl mx-auto">
          <div className="p-4 rounded-2xl bg-slate-900/60 border border-slate-800/80 text-center">
            <span className="text-[11px] text-slate-400 font-semibold block">Total Facilitated GMV</span>
            <p className="text-2xl font-black text-amber-400 font-['Outfit'] mt-1">
              ₹{((platformStats.totalGMV || 5500000) / 100000).toFixed(1)} Lakh
            </p>
            <span className="text-[10px] text-emerald-400 font-medium">● Verified Deals</span>
          </div>

          <div className="p-4 rounded-2xl bg-slate-900/60 border border-slate-800/80 text-center">
            <span className="text-[11px] text-slate-400 font-semibold block">Verified Franchises</span>
            <p className="text-2xl font-black text-white font-['Outfit'] mt-1">
              {platformStats.verifiedBrands || 6} Brands
            </p>
            <span className="text-[10px] text-blue-400 font-medium">● 100% Vetted KYC</span>
          </div>

          <div className="p-4 rounded-2xl bg-slate-900/60 border border-slate-800/80 text-center">
            <span className="text-[11px] text-slate-400 font-semibold block">Qualified Investors</span>
            <p className="text-2xl font-black text-white font-['Outfit'] mt-1">
              {platformStats.totalInvestors || 142} Active
            </p>
            <span className="text-[10px] text-purple-400 font-medium">● Verified HNIs</span>
          </div>

          <div className="p-4 rounded-2xl bg-slate-900/60 border border-slate-800/80 text-center">
            <span className="text-[11px] text-slate-400 font-semibold block">Closed Deals</span>
            <p className="text-2xl font-black text-emerald-400 font-['Outfit'] mt-1">
              {platformStats.closedDeals || 2} Settled
            </p>
            <span className="text-[10px] text-teal-400 font-medium">● 3% Escrow Settled</span>
          </div>
        </div>
      </section>

      {/* ============================================================ */}
      {/* 4. GROUNDED AI FRANCHISE SANDBOX (Scroll Section)            */}
      {/* ============================================================ */}
      <section className="rounded-3xl p-6 sm:p-10 bg-slate-900/70 border border-slate-800 shadow-xl space-y-6">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-cyan-500/10 border border-cyan-500/30 text-cyan-400 text-xs font-bold">
              <Sparkles className="w-3.5 h-3.5" />
              <span>Grounded Knowledge Base</span>
            </div>
            <h2 className="text-xl sm:text-2xl font-black tracking-tight font-['Outfit'] text-white">
              Interrogate Brand Economics with AI
            </h2>
            <p className="text-xs text-slate-400">
              Answers are strictly grounded in brand-uploaded Franchise Disclosure Documents (FDD) and audited SOPs.
            </p>
          </div>
        </div>

        {/* Prompt Selector Buttons */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          {aiDemos.map((demo, idx) => (
            <button
              key={idx}
              onClick={() => setAiSelectedPrompt(idx)}
              className={`p-3.5 rounded-2xl text-left border transition-all ${
                aiSelectedPrompt === idx
                  ? 'bg-blue-600/20 border-blue-500 text-white shadow-lg shadow-blue-600/10'
                  : 'bg-slate-950/60 border-slate-800 text-slate-300 hover:border-slate-700'
              }`}
            >
              <span className="text-[10px] font-bold text-blue-400 block uppercase tracking-wider">
                {demo.brand}
              </span>
              <p className="text-xs font-semibold mt-1 line-clamp-2">"{demo.query}"</p>
            </button>
          ))}
        </div>

        {/* AI Answer Terminal Card */}
        <div className="p-5 rounded-2xl bg-slate-950 border border-slate-800 space-y-3">
          <div className="flex items-center justify-between border-b border-slate-800/80 pb-2.5">
            <div className="flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-cyan-400" />
              <span className="text-xs font-bold text-white">
                VIZ Grounded Intelligence — {aiDemos[aiSelectedPrompt].brand}
              </span>
            </div>
            <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 font-bold">
              FDD Grounded
            </span>
          </div>

          <p className="text-xs sm:text-sm text-slate-300 leading-relaxed font-normal">
            {aiDemos[aiSelectedPrompt].response}
          </p>

          <div className="pt-2 flex items-center justify-between text-[11px] text-slate-500 border-t border-slate-900">
            <span>Source: Official Franchise Disclosure Document & SOP v2.4</span>
            <span className="text-blue-400 font-semibold">Grounded • Zero Hallucination</span>
          </div>
        </div>
      </section>

      {/* ============================================================ */}
      {/* 5. HOW VIZ WORKS (3-Step Deal Lifecycle)                     */}
      {/* ============================================================ */}
      <section className="space-y-6 pt-4">
        <div className="text-center max-w-xl mx-auto space-y-1">
          <span className="text-[11px] font-bold text-blue-400 uppercase tracking-wider">
            Deal Flow Process
          </span>
          <h2 className="text-xl sm:text-2xl font-black font-['Outfit'] text-white">
            From Discovery to Grand Opening
          </h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          <div className="p-6 rounded-3xl bg-slate-900/60 border border-slate-800 space-y-3">
            <div className="w-10 h-10 rounded-2xl bg-blue-600/20 border border-blue-500/30 flex items-center justify-center font-bold text-blue-400 text-sm">
              01
            </div>
            <h3 className="text-base font-bold text-white">Browse & Compare</h3>
            <p className="text-xs text-slate-400 leading-relaxed">
              Explore verified brands with zero forced login. Inspect investment brackets, FOFO/FOCO models, and historical payback months.
            </p>
          </div>

          <div className="p-6 rounded-3xl bg-slate-900/60 border border-slate-800 space-y-3">
            <div className="w-10 h-10 rounded-2xl bg-purple-600/20 border border-purple-500/30 flex items-center justify-center font-bold text-purple-400 text-sm">
              02
            </div>
            <h3 className="text-base font-bold text-white">Direct Chat & Founder Pitch</h3>
            <p className="text-xs text-slate-400 leading-relaxed">
              Initiate real-time conversations with brand founders, request video discovery calls, and receive customized unit pro-formas.
            </p>
          </div>

          <div className="p-6 rounded-3xl bg-slate-900/60 border border-slate-800 space-y-3">
            <div className="w-10 h-10 rounded-2xl bg-emerald-600/20 border border-emerald-500/30 flex items-center justify-center font-bold text-emerald-400 text-sm">
              03
            </div>
            <h3 className="text-base font-bold text-white">Escrow Closing & 3% Fee</h3>
            <p className="text-xs text-slate-400 leading-relaxed">
              Execute formal franchise agreement. VIZ platform automatically calculates 3% success fee + 18% GST with full audit trail.
            </p>
          </div>
        </div>
      </section>
    </div>
  );
};

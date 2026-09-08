import React, { useState, useEffect } from 'react';
import { IBrand } from '../types';
import { brandApi, investorApi } from '../services/api';
import { useAuth } from '../context/AuthContext';
import { BrandReelCard } from '../components/BrandReelCard';
import {
  Sparkles,
  Search,
  SlidersHorizontal,
  Flame,
  Building,
  CheckCircle2,
  Calendar,
  IndianRupee,
  Filter,
  Layers,
  ArrowRight,
  TrendingUp,
} from 'lucide-react';

interface InvestorExpoViewProps {
  onOpenChat: (brand: IBrand) => void;
  onOpenMeeting: (brand: IBrand) => void;
  onOpenDetails: (brand: IBrand) => void;
  onOpenProfileSetup: () => void;
}

export const InvestorExpoView: React.FC<InvestorExpoViewProps> = ({
  onOpenChat,
  onOpenMeeting,
  onOpenDetails,
  onOpenProfileSetup,
}) => {
  const { user } = useAuth();
  const [brands, setBrands] = useState<IBrand[]>([]);
  const [matches, setMatches] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // Filters State
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [selectedBudget, setSelectedBudget] = useState<string>('');
  const [selectedModel, setSelectedModel] = useState<string>('All');
  const [searchQuery, setSearchQuery] = useState<string>('');

  const categories = [
    'All',
    'Food',
    'Education',
    'Retail',
    'Fitness',
    'Beauty',
    'Healthcare',
    'EV',
    'Technology',
  ];

  const budgetOptions = [
    { id: '', label: 'All Budgets' },
    { id: 'UNDER_5L', label: 'Under ₹5L' },
    { id: '5L_10L', label: '₹5–10L' },
    { id: '10L_25L', label: '₹10–25L' },
    { id: '25L_50L', label: '₹25–50L' },
    { id: '50L_1CR', label: '₹50L–1Cr' },
    { id: '1CR_PLUS', label: '₹1Cr+' },
  ];

  const loadBrandsAndMatches = async () => {
    setLoading(true);
    const hasInvestorAuth = Boolean(localStorage.getItem('viz_auth_token') && user?.role === 'INVESTOR');
    try {
      const [brandsRes, matchesRes] = await Promise.all([
        brandApi.getBrands({
          category: selectedCategory !== 'All' ? selectedCategory : undefined,
          budgetBracket: selectedBudget || undefined,
          model: selectedModel !== 'All' ? selectedModel : undefined,
          search: searchQuery || undefined,
        }),
        hasInvestorAuth
          ? investorApi.getMatches().catch(() => ({ data: { matches: [] } }))
          : Promise.resolve({ data: { matches: [] } }),
      ]);

      if (brandsRes.data.success) {
        setBrands(brandsRes.data.brands);
      }
      if (matchesRes.data.matches) {
        setMatches(matchesRes.data.matches);
      }
    } catch (err) {
      console.error('Error fetching expo floor brands', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadBrandsAndMatches();
  }, [selectedCategory, selectedBudget, selectedModel, searchQuery]);

  return (
    <div className="space-y-8 pb-16">
      {/* Hero Banner with Netflix Dark Aesthetic */}
      <div className="relative rounded-3xl overflow-hidden bg-gradient-to-r from-blue-950 via-slate-900 to-indigo-950 border border-blue-500/20 p-6 sm:p-10 shadow-2xl">
        <div className="relative z-10 max-w-3xl space-y-4">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-500/10 border border-blue-500/30 text-blue-400 text-xs font-semibold">
            <Sparkles className="w-3.5 h-3.5" />
            <span>VIZ INDIA DIGITAL EXPO 2026</span>
          </div>

          <h1 className="text-3xl sm:text-5xl font-black text-white tracking-tight font-['Outfit'] leading-tight">
            Don't visit an Expo. <br />
            <span className="gradient-text-blue">Enter the Expo digitally.</span>
          </h1>

          <p className="text-sm sm:text-base text-slate-300 leading-relaxed max-w-2xl">
            Discover verified franchises, watch high-definition pitch video reels, query AI assistants for instant grounded facts, and schedule direct 1-on-1 discovery calls with brand leadership.
          </p>

          {/* Quick AI Match Callout */}
          <div className="pt-2 flex flex-wrap items-center gap-3">
            <div className="flex items-center gap-3 bg-slate-900/90 border border-slate-700/80 rounded-2xl px-4 py-2.5 shadow-lg">
              <div className="w-9 h-9 rounded-xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center font-bold">
                <Flame className="w-5 h-5" />
              </div>
              <div>
                <p className="text-xs font-bold text-white">AI Match for You</p>
                <p className="text-[11px] text-slate-400">
                  {matches.length > 0 ? `${matches.length} brands matched with your profile` : 'Calibrate your criteria'}
                </p>
              </div>
              <button
                onClick={onOpenProfileSetup}
                className="ml-2 px-3 py-1.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-semibold flex items-center gap-1 transition-all"
              >
                <span>View Matches</span>
                <ArrowRight className="w-3 h-3" />
              </button>
            </div>
          </div>
        </div>

        {/* Decorative Background Grid */}
        <div className="absolute right-0 top-0 bottom-0 w-1/3 bg-gradient-to-l from-blue-600/10 to-transparent pointer-events-none"></div>
      </div>

      {/* Search & Global Filter Bar */}
      <div className="space-y-4">
        <div className="flex flex-col md:flex-row gap-3 items-center justify-between">
          {/* Search Input */}
          <div className="relative w-full md:max-w-md">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search by brand name, category, or city..."
              className="w-full bg-slate-900 border border-slate-800 rounded-2xl pl-10 pr-4 py-2.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-blue-500 shadow-inner"
            />
          </div>

          {/* Model Filter Pills */}
          <div className="flex items-center gap-1.5 self-start md:self-auto overflow-x-auto w-full md:w-auto">
            <span className="text-xs text-slate-400 font-medium mr-1 hidden sm:inline">Format:</span>
            {['All', 'FOFO', 'FOCO'].map((m) => (
              <button
                key={m}
                onClick={() => setSelectedModel(m)}
                className={`px-3 py-1.5 rounded-xl text-xs font-medium transition-all ${
                  selectedModel === m
                    ? 'bg-blue-600 text-white shadow-sm'
                    : 'bg-slate-900 text-slate-400 border border-slate-800 hover:text-slate-200'
                }`}
              >
                {m === 'All' ? 'All Formats' : m}
              </button>
            ))}
          </div>
        </div>

        {/* Categories Bar */}
        <div className="flex items-center gap-2 overflow-x-auto pb-2 no-scrollbar">
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`px-4 py-2 rounded-2xl text-xs font-semibold whitespace-nowrap transition-all flex items-center gap-1.5 ${
                selectedCategory === cat
                  ? 'bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-md shadow-blue-600/20'
                  : 'bg-slate-900/80 text-slate-400 border border-slate-800/80 hover:text-slate-200 hover:bg-slate-800'
              }`}
            >
              <span>{cat}</span>
            </button>
          ))}
        </div>

        {/* Investment Range Horizontal Bar */}
        <div className="flex items-center gap-2 overflow-x-auto pb-1 no-scrollbar text-xs">
          <span className="text-slate-400 font-medium shrink-0 flex items-center gap-1">
            <IndianRupee className="w-3.5 h-3.5 text-emerald-400" />
            Budget:
          </span>
          {budgetOptions.map((b) => (
            <button
              key={b.id}
              onClick={() => setSelectedBudget(b.id)}
              className={`px-3 py-1 rounded-xl whitespace-nowrap transition-all ${
                selectedBudget === b.id
                  ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 font-bold'
                  : 'bg-slate-950 text-slate-400 border border-slate-800/60 hover:text-slate-200'
              }`}
            >
              {b.label}
            </button>
          ))}
        </div>
      </div>

      {/* Brand Showcase Section (Netflix Style Reels & Cards) */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="text-xl font-bold text-white tracking-tight font-['Outfit'] flex items-center gap-2">
              <span>🎬 Brand Showcase</span>
              <span className="text-xs px-2 py-0.5 rounded-full bg-slate-800 text-slate-400 font-normal">
                {brands.length} Brands Available
              </span>
            </h2>
            <p className="text-xs text-slate-400">Hover video to watch pitch, ask AI or book direct meeting</p>
          </div>
        </div>

        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <div key={i} className="h-80 rounded-2xl bg-slate-900/60 animate-pulse border border-slate-800"></div>
            ))}
          </div>
        ) : brands.length === 0 ? (
          <div className="p-12 rounded-2xl bg-slate-900/40 border border-slate-800 text-center space-y-3">
            <Building className="w-12 h-12 mx-auto text-slate-600" />
            <p className="text-sm font-semibold text-slate-300">No brands found matching this filter criteria.</p>
            <button
              onClick={() => {
                setSelectedCategory('All');
                setSelectedBudget('');
                setSelectedModel('All');
                setSearchQuery('');
              }}
              className="px-4 py-2 rounded-xl bg-blue-600 text-white text-xs font-semibold"
            >
              Reset Filters
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {brands.map((brand) => {
              const matchObj = matches.find((m) => m.brand?._id === brand._id);
              return (
                <BrandReelCard
                  key={brand._id}
                  brand={brand}
                  matchScore={matchObj?.matchScore}
                  onOpenChat={onOpenChat}
                  onOpenMeeting={onOpenMeeting}
                  onOpenDetails={onOpenDetails}
                />
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};

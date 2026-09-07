import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { brandApi } from '../services/api';
import { IBrand } from '../types';
import {
  Sparkles,
  ArrowRight,
  ShieldCheck,
  TrendingUp,
  Building2,
  Users,
  CheckCircle2,
  Zap,
  Lock,
  ChevronRight,
  Play,
  Award,
} from 'lucide-react';

interface PublicLandingViewProps {
  onOpenLogin: (preferredRole?: 'INVESTOR' | 'BRAND') => void;
  onOpenBrandDetails?: (brand: IBrand) => void;
}

export const PublicLandingView: React.FC<PublicLandingViewProps> = ({
  onOpenLogin,
  onOpenBrandDetails,
}) => {
  const navigate = useNavigate();
  const { user, activePersona } = useAuth();
  const [featuredBrands, setFeaturedBrands] = useState<IBrand[]>([]);
  const [loadingBrands, setLoadingBrands] = useState(true);

  // Load public verified brands only — ZERO auth required, ZERO 401 errors
  useEffect(() => {
    let isMounted = true;
    const loadFeatured = async () => {
      try {
        const res = await brandApi.getBrands({ featuredOnly: true });
        if (isMounted && res.data.success) {
          setFeaturedBrands(res.data.brands || []);
        }
      } catch (err) {
        // Silently fail on network disconnect
      } finally {
        if (isMounted) setLoadingBrands(false);
      }
    };
    loadFeatured();
    return () => {
      isMounted = false;
    };
  }, []);

  const handleActionClick = (targetRole: 'INVESTOR' | 'BRAND' = 'INVESTOR') => {
    if (user) {
      if (activePersona === 'ADMIN') navigate('/admin-dashboard');
      else if (activePersona === 'BRAND') navigate('/brand-portal');
      else navigate('/expo-floor');
    } else {
      onOpenLogin(targetRole);
    }
  };

  return (
    <div className="space-y-16 pb-20 text-white">
      {/* 1. Hero Section */}
      <section className="relative rounded-3xl overflow-hidden bg-gradient-to-b from-blue-950/60 via-slate-900 to-[#07090e] border border-blue-500/20 p-8 sm:p-14 shadow-2xl">
        <div className="absolute top-0 right-0 w-96 h-96 bg-blue-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 left-0 w-96 h-96 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 max-w-3xl space-y-6">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-blue-500/10 border border-blue-500/30 text-blue-400 text-xs font-bold tracking-wider uppercase">
            <Sparkles className="w-4 h-4" />
            <span>India's 1st Virtual 24/7 B2B Franchise Marketplace</span>
          </div>

          <h1 className="text-4xl sm:text-6xl font-black tracking-tight font-['Outfit'] leading-tight">
            Don't visit an Expo. <br />
            <span className="bg-gradient-to-r from-blue-400 via-indigo-300 to-cyan-400 bg-clip-text text-transparent">
              Enter the Expo digitally.
            </span>
          </h1>

          <p className="text-sm sm:text-base text-slate-300 leading-relaxed max-w-2xl font-normal">
            Discover verified franchisors, explore unit economics with Grounded AI,
            schedule 1-on-1 territory meetings, and close deals securely with VIZ 3% escrow settlement.
          </p>

          <div className="flex flex-wrap items-center gap-3.5 pt-2">
            <button
              onClick={() => handleActionClick('INVESTOR')}
              className="px-6 py-3.5 rounded-2xl bg-gradient-to-r from-blue-600 via-indigo-600 to-cyan-500 hover:from-blue-500 hover:to-cyan-400 text-white text-xs sm:text-sm font-bold flex items-center gap-2.5 shadow-xl shadow-blue-600/30 transition-all hover:scale-[1.02] active:scale-[0.98]"
            >
              <span>Explore Expo Floor</span>
              <ArrowRight className="w-4 h-4" />
            </button>

            <button
              onClick={() => handleActionClick('BRAND')}
              className="px-6 py-3.5 rounded-2xl bg-slate-900 hover:bg-slate-800 border border-slate-700 hover:border-purple-500/50 text-slate-200 text-xs sm:text-sm font-bold flex items-center gap-2 transition-all"
            >
              <Building2 className="w-4 h-4 text-purple-400" />
              <span>Register as Franchisor Brand</span>
            </button>
          </div>
        </div>

        {/* Live Marketplace Stat Bar */}
        <div className="relative z-10 grid grid-cols-2 sm:grid-cols-4 gap-4 mt-12 pt-8 border-t border-slate-800/80">
          <div className="space-y-1">
            <div className="text-2xl sm:text-3xl font-black font-['Outfit'] text-white">₹120 Cr+</div>
            <div className="text-[11px] font-semibold text-slate-400">Total Investment Pipeline</div>
          </div>
          <div className="space-y-1">
            <div className="text-2xl sm:text-3xl font-black font-['Outfit'] text-blue-400">45+ Brands</div>
            <div className="text-[11px] font-semibold text-slate-400">Audited & Verified</div>
          </div>
          <div className="space-y-1">
            <div className="text-2xl sm:text-3xl font-black font-['Outfit'] text-emerald-400">9–14 Mo</div>
            <div className="text-[11px] font-semibold text-slate-400">Average Historical ROI</div>
          </div>
          <div className="space-y-1">
            <div className="text-2xl sm:text-3xl font-black font-['Outfit'] text-amber-400">100% Escrow</div>
            <div className="text-[11px] font-semibold text-slate-400">3% Commission Settlement</div>
          </div>
        </div>
      </section>

      {/* 2. Featured Verified Franchises Preview (Public, no auth needed) */}
      <section className="space-y-6">
        <div className="flex items-center justify-between">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <Award className="w-5 h-5 text-blue-400" />
              <h2 className="text-xl sm:text-2xl font-black tracking-tight font-['Outfit'] text-white">
                Featured Verified Brands
              </h2>
            </div>
            <p className="text-xs text-slate-400">
              Hand-vetted franchise opportunities with verified unit economics and territory availability
            </p>
          </div>
          <button
            onClick={() => handleActionClick('INVESTOR')}
            className="text-xs font-bold text-blue-400 hover:text-blue-300 flex items-center gap-1 transition-all"
          >
            <span>View All Brands</span>
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>

        {loadingBrands ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-64 rounded-3xl bg-slate-900/60 border border-slate-800 animate-pulse" />
            ))}
          </div>
        ) : featuredBrands.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {featuredBrands.slice(0, 3).map((brand) => (
              <div
                key={brand._id}
                className="group rounded-3xl bg-slate-900 border border-slate-800 hover:border-blue-500/50 p-5 space-y-4 shadow-lg hover:shadow-2xl hover:shadow-blue-500/10 transition-all duration-300 flex flex-col justify-between"
              >
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <img
                      src={brand.logoUrl}
                      alt={brand.brandName}
                      className="w-12 h-12 rounded-2xl object-cover border border-slate-700"
                    />
                    <div className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-blue-500/10 border border-blue-500/30 text-blue-400 text-[10px] font-bold">
                      <ShieldCheck className="w-3 h-3" />
                      <span>VIZ Verified</span>
                    </div>
                  </div>

                  <div>
                    <h3 className="text-base font-bold text-white group-hover:text-blue-400 transition-colors">
                      {brand.brandName}
                    </h3>
                    <p className="text-xs text-slate-400 line-clamp-2 mt-1">{brand.description}</p>
                  </div>

                  <div className="grid grid-cols-2 gap-2 pt-2 text-xs border-t border-slate-800/80">
                    <div>
                      <span className="text-[10px] text-slate-500 block">Investment Range</span>
                      <span className="font-bold text-white">{brand.investmentRange?.displayString}</span>
                    </div>
                    <div>
                      <span className="text-[10px] text-slate-500 block">Model</span>
                      <span className="font-bold text-amber-400">{brand.businessModel}</span>
                    </div>
                  </div>
                </div>

                <div className="pt-2 flex items-center gap-2">
                  <button
                    onClick={() => {
                      if (onOpenBrandDetails) onOpenBrandDetails(brand);
                      else handleActionClick('INVESTOR');
                    }}
                    className="flex-1 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-xs font-bold text-white transition-all text-center"
                  >
                    View Dossier
                  </button>
                  <button
                    onClick={() => handleActionClick('INVESTOR')}
                    className="p-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white transition-all"
                    title="Sign In to Book Meeting"
                  >
                    <ArrowRight className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="p-8 rounded-3xl bg-slate-900 border border-slate-800 text-center text-slate-400 text-xs">
            No featured brands currently listed. Check back shortly.
          </div>
        )}
      </section>

      {/* 3. Three Pillars Workflow for Investors, Brands & Admins */}
      <section className="space-y-6">
        <div className="text-center max-w-2xl mx-auto space-y-2">
          <h2 className="text-2xl sm:text-3xl font-black tracking-tight font-['Outfit'] text-white">
            Built for Serious B2B Franchise Transactions
          </h2>
          <p className="text-xs sm:text-sm text-slate-400">
            A three-way ecosystem giving each participant dedicated tooling and verified data.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Pillar 1: Investor */}
          <div className="rounded-3xl bg-gradient-to-b from-blue-950/40 to-slate-900 border border-blue-500/20 p-6 space-y-4">
            <div className="w-12 h-12 rounded-2xl bg-blue-500/20 text-blue-400 flex items-center justify-center font-bold">
              <Users className="w-6 h-6" />
            </div>
            <h3 className="text-lg font-bold text-white">For Franchise Investors</h3>
            <ul className="space-y-2.5 text-xs text-slate-300">
              <li className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-blue-400 flex-shrink-0" />
                <span>AI-Powered Matchmaking Matrix (Budget & Category fit)</span>
              </li>
              <li className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-blue-400 flex-shrink-0" />
                <span>Grounded AI Bot answering confidential unit economics</span>
              </li>
              <li className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-blue-400 flex-shrink-0" />
                <span>Direct 1-on-1 territory discovery call scheduling</span>
              </li>
            </ul>
            <button
              onClick={() => handleActionClick('INVESTOR')}
              className="w-full mt-4 py-2.5 rounded-xl bg-blue-600/30 hover:bg-blue-600 text-blue-300 hover:text-white border border-blue-500/30 text-xs font-bold transition-all"
            >
              Enter as Investor
            </button>
          </div>

          {/* Pillar 2: Franchisor Brand */}
          <div className="rounded-3xl bg-gradient-to-b from-purple-950/40 to-slate-900 border border-purple-500/20 p-6 space-y-4">
            <div className="w-12 h-12 rounded-2xl bg-purple-500/20 text-purple-400 flex items-center justify-center font-bold">
              <Building2 className="w-6 h-6" />
            </div>
            <h3 className="text-lg font-bold text-white">For Franchisor Brands</h3>
            <ul className="space-y-2.5 text-xs text-slate-300">
              <li className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-purple-400 flex-shrink-0" />
                <span>24/7 Digital Interactive Expo Booth & Pitch Reel</span>
              </li>
              <li className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-purple-400 flex-shrink-0" />
                <span>Leads CRM Kanban Pipeline (New to Closed-Won)</span>
              </li>
              <li className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-purple-400 flex-shrink-0" />
                <span>Custom Knowledge Base chunking for AI training</span>
              </li>
            </ul>
            <button
              onClick={() => handleActionClick('BRAND')}
              className="w-full mt-4 py-2.5 rounded-xl bg-purple-600/30 hover:bg-purple-600 text-purple-300 hover:text-white border border-purple-500/30 text-xs font-bold transition-all"
            >
              Enter as Brand Partner
            </button>
          </div>

          {/* Pillar 3: VIZ Platform */}
          <div className="rounded-3xl bg-gradient-to-b from-amber-950/40 to-slate-900 border border-amber-500/20 p-6 space-y-4">
            <div className="w-12 h-12 rounded-2xl bg-amber-500/20 text-amber-400 flex items-center justify-center font-bold">
              <ShieldCheck className="w-6 h-6" />
            </div>
            <h3 className="text-lg font-bold text-white">VIZ Trust & Settlement</h3>
            <ul className="space-y-2.5 text-xs text-slate-300">
              <li className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-amber-400 flex-shrink-0" />
                <span>Rigorous brand KYC and disclosure verification</span>
              </li>
              <li className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-amber-400 flex-shrink-0" />
                <span>Transparent 3% success-fee commission ledger</span>
              </li>
              <li className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-amber-400 flex-shrink-0" />
                <span>Direct UTR/RTGS settlement verification</span>
              </li>
            </ul>
            <button
              onClick={() => onOpenLogin('INVESTOR')}
              className="w-full mt-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white text-xs font-bold transition-all"
            >
              Platform Sign In
            </button>
          </div>
        </div>
      </section>
    </div>
  );
};

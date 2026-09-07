import React from 'react';
import { useAuth } from '../context/AuthContext';
import {
  Sparkles,
  Building2,
  ShieldCheck,
  GitCompare,
  UserCircle,
  LogOut,
  LogIn,
  Layers,
  Award,
  Calendar,
  DollarSign,
  TrendingUp,
} from 'lucide-react';

interface NavbarProps {
  currentTab: 'expo' | 'brand-portal' | 'admin-center' | 'my-deals' | 'my-meetings';
  setCurrentTab: (tab: 'expo' | 'brand-portal' | 'admin-center' | 'my-deals' | 'my-meetings') => void;
  onOpenCompare: () => void;
  onOpenProfileSetup: () => void;
  onOpenLoginModal: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  currentTab,
  setCurrentTab,
  onOpenCompare,
  onOpenProfileSetup,
  onOpenLoginModal,
}) => {
  const { user, role, activePersona, logout, compareBrandIds } = useAuth();

  const getRoleBadge = () => {
    switch (role) {
      case 'VIZ_ADMIN':
        return {
          label: 'Admin Staff',
          color: 'bg-amber-500/20 text-amber-300 border-amber-500/30',
          icon: <ShieldCheck className="w-3 h-3 text-amber-400" />,
        };
      case 'BRAND_ADMIN':
        return {
          label: 'Brand Partner',
          color: 'bg-purple-500/20 text-purple-300 border-purple-500/30',
          icon: <Building2 className="w-3 h-3 text-purple-400" />,
        };
      default:
        return {
          label: 'Investor',
          color: 'bg-blue-500/20 text-blue-300 border-blue-500/30',
          icon: <UserCircle className="w-3 h-3 text-blue-400" />,
        };
    }
  };

  const badge = getRoleBadge();

  return (
    <header className="sticky top-0 z-40 w-full border-b border-slate-800/80 bg-[#07090e]/95 backdrop-blur-xl">
      {/* Top Status & Role Header */}
      <div className="bg-slate-950/80 px-4 py-1.5 border-b border-slate-800/60 flex flex-wrap items-center justify-between gap-2 text-xs">
        <div className="flex items-center gap-2 text-slate-300">
          <span className="flex h-2 w-2 rounded-full bg-emerald-400 animate-pulse"></span>
          <span className="font-semibold text-white tracking-wide uppercase">⚡ VIZ India Digital Expo</span>
          <span className="hidden sm:inline text-slate-500">| 24/7 Digital B2B Franchise Marketplace</span>
        </div>

        <div className="flex items-center gap-3">
          {user ? (
            <div className="flex items-center gap-2">
              <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold border flex items-center gap-1 ${badge.color}`}>
                {badge.icon}
                <span>{badge.label}</span>
              </span>
              <button
                onClick={onOpenLoginModal}
                className="text-[11px] text-slate-400 hover:text-white transition-colors underline underline-offset-2"
              >
                Switch Account
              </button>
            </div>
          ) : (
            <button
              onClick={onOpenLoginModal}
              className="text-[11px] text-blue-400 hover:text-blue-300 font-semibold flex items-center gap-1"
            >
              <LogIn className="w-3 h-3" />
              <span>Sign In / Register</span>
            </button>
          )}
        </div>
      </div>

      {/* Main Navigation Bar */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        {/* Brand Logo */}
        <div
          className="flex items-center gap-3 cursor-pointer"
          onClick={() => {
            if (activePersona === 'ADMIN') setCurrentTab('admin-center');
            else if (activePersona === 'BRAND') setCurrentTab('brand-portal');
            else setCurrentTab('expo');
          }}
        >
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-blue-600 via-indigo-500 to-cyan-400 flex items-center justify-center shadow-lg shadow-blue-500/20 font-black text-xl text-white">
            V
          </div>
          <div>
            <div className="flex items-center gap-1.5">
              <span className="font-extrabold text-lg tracking-tight text-white font-['Outfit']">VIZ INDIA</span>
              <span className="text-[10px] font-bold uppercase tracking-wider bg-blue-500/20 text-blue-400 px-1.5 py-0.5 rounded border border-blue-500/30">
                EXPO 24/7
              </span>
            </div>
            <p className="text-[10px] text-slate-400 hidden sm:block">Digital B2B Franchise Marketplace</p>
          </div>
        </div>

        {/* Role-Specific Center Navigation Tabs */}
        <nav className="hidden md:flex items-center gap-1">
          {/* INVESTOR NAVBAR */}
          {activePersona === 'INVESTOR' && (
            <>
              <button
                onClick={() => setCurrentTab('expo')}
                className={`px-3.5 py-2 rounded-lg text-sm font-medium transition-all ${
                  currentTab === 'expo'
                    ? 'text-white bg-slate-800/80 border border-slate-700 shadow-sm'
                    : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900/50'
                }`}
              >
                🎬 Expo Floor
              </button>
              <button
                onClick={() => setCurrentTab('my-meetings')}
                className={`px-3.5 py-2 rounded-lg text-sm font-medium transition-all ${
                  currentTab === 'my-meetings'
                    ? 'text-white bg-slate-800/80 border border-slate-700 shadow-sm'
                    : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900/50'
                }`}
              >
                📅 My Meetings
              </button>
              <button
                onClick={() => setCurrentTab('my-deals')}
                className={`px-3.5 py-2 rounded-lg text-sm font-medium transition-all ${
                  currentTab === 'my-deals'
                    ? 'text-white bg-slate-800/80 border border-slate-700 shadow-sm'
                    : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900/50'
                }`}
              >
                🤝 My Deals
              </button>
            </>
          )}

          {/* BRAND NAVBAR */}
          {activePersona === 'BRAND' && (
            <>
              <button
                onClick={() => setCurrentTab('brand-portal')}
                className={`px-3.5 py-2 rounded-lg text-sm font-medium transition-all ${
                  currentTab === 'brand-portal'
                    ? 'text-purple-300 bg-purple-950/40 border border-purple-800/50 shadow-sm'
                    : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900/50'
                }`}
              >
                🏢 Brand Portal (CRM)
              </button>
              <button
                onClick={() => setCurrentTab('expo')}
                className={`px-3.5 py-2 rounded-lg text-sm font-medium transition-all ${
                  currentTab === 'expo'
                    ? 'text-white bg-slate-800/80 border border-slate-700 shadow-sm'
                    : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900/50'
                }`}
              >
                🎬 View Public Booth Floor
              </button>
            </>
          )}

          {/* ADMIN NAVBAR */}
          {activePersona === 'ADMIN' && (
            <>
              <button
                onClick={() => setCurrentTab('admin-center')}
                className={`px-3.5 py-2 rounded-lg text-sm font-medium transition-all ${
                  currentTab === 'admin-center'
                    ? 'text-amber-300 bg-amber-950/40 border border-amber-800/50 shadow-sm'
                    : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900/50'
                }`}
              >
                👑 Command Center & 3% Ledger
              </button>
              <button
                onClick={() => setCurrentTab('expo')}
                className={`px-3.5 py-2 rounded-lg text-sm font-medium transition-all ${
                  currentTab === 'expo'
                    ? 'text-white bg-slate-800/80 border border-slate-700 shadow-sm'
                    : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900/50'
                }`}
              >
                🎬 Preview Expo Floor
              </button>
            </>
          )}
        </nav>

        {/* Right Actions */}
        <div className="flex items-center gap-3">
          {/* Multi-Brand Compare Trigger (Investor Only) */}
          {activePersona === 'INVESTOR' && compareBrandIds.length > 0 && (
            <button
              onClick={onOpenCompare}
              className="relative px-3 py-1.5 rounded-lg bg-blue-600 hover:bg-blue-500 text-white text-xs font-semibold flex items-center gap-1.5 transition-all shadow-md shadow-blue-600/30 animate-pulse"
            >
              <GitCompare className="w-3.5 h-3.5" />
              <span>Compare ({compareBrandIds.length})</span>
            </button>
          )}

          {/* Matchmaking Profile Trigger (Investor Only) */}
          {activePersona === 'INVESTOR' && (
            <button
              onClick={onOpenProfileSetup}
              className="px-3 py-1.5 rounded-lg bg-slate-900 hover:bg-slate-800 border border-slate-700 text-slate-300 hover:text-white text-xs font-medium flex items-center gap-1.5 transition-all"
            >
              <Sparkles className="w-3.5 h-3.5 text-blue-400" />
              <span>Match Profile</span>
            </button>
          )}

          {/* User Account Pill & Actions */}
          {user ? (
            <div className="flex items-center gap-2 pl-2 border-l border-slate-800">
              <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-slate-700 to-slate-800 border border-slate-600 flex items-center justify-center font-bold text-xs text-white">
                {user?.name?.charAt(0) || 'U'}
              </div>
              <div className="hidden lg:block text-left">
                <p className="text-xs font-semibold text-white leading-tight">{user?.name || 'User'}</p>
                <p className="text-[10px] text-slate-400 font-medium leading-tight">{user?.role}</p>
              </div>
              <button
                onClick={logout}
                title="Log Out"
                className="p-1.5 rounded-lg text-slate-400 hover:text-red-400 hover:bg-slate-900 transition-colors ml-1"
              >
                <LogOut className="w-4 h-4" />
              </button>
            </div>
          ) : (
            <button
              onClick={onOpenLoginModal}
              className="px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold transition-all shadow-md shadow-blue-600/20 flex items-center gap-1.5"
            >
              <LogIn className="w-4 h-4" />
              <span>Sign In</span>
            </button>
          )}
        </div>
      </div>
    </header>
  );
};

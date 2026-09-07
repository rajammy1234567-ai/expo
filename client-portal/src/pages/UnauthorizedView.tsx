import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { ShieldAlert, ArrowRight, Home } from 'lucide-react';

export const UnauthorizedView: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { user, activePersona } = useAuth();

  const currentRole = (location.state as any)?.currentRole || user?.role || 'GUEST';
  const attemptedPath = (location.state as any)?.attemptedPath || '';

  const getDashboardPath = () => {
    if (activePersona === 'ADMIN') return '/admin-dashboard';
    if (activePersona === 'BRAND') return '/brand-portal';
    return '/expo-floor';
  };

  const getRoleTitle = (role: string) => {
    if (role === 'VIZ_ADMIN') return 'Platform Admin';
    if (role === 'BRAND_ADMIN') return 'Franchisor Brand Partner';
    if (role === 'INVESTOR') return 'Franchise Investor';
    return 'Guest';
  };

  return (
    <div className="min-h-[80vh] flex items-center justify-center p-4">
      <div className="max-w-md w-full rounded-3xl bg-slate-900 border border-slate-800 p-8 text-center space-y-6 shadow-2xl">
        <div className="w-16 h-16 mx-auto rounded-3xl bg-amber-500/10 border border-amber-500/30 text-amber-400 flex items-center justify-center">
          <ShieldAlert className="w-8 h-8" />
        </div>

        <div className="space-y-2">
          <div className="inline-block px-3 py-1 rounded-full bg-red-500/10 border border-red-500/20 text-red-400 text-xs font-bold uppercase tracking-wider">
            403 Forbidden Access
          </div>
          <h2 className="text-2xl font-black text-white font-['Outfit']">
            Restricted Page
          </h2>
          <p className="text-xs text-slate-400 leading-relaxed">
            Your account is authenticated as{' '}
            <span className="text-blue-400 font-semibold">{getRoleTitle(currentRole)}</span>, which does not have authorization to view{' '}
            <span className="text-slate-200 font-mono">{attemptedPath || 'this internal screen'}</span>.
          </p>
        </div>

        <div className="pt-2 space-y-2">
          <button
            onClick={() => navigate(getDashboardPath())}
            className="w-full py-3.5 rounded-2xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white text-xs font-bold flex items-center justify-center gap-2 shadow-lg shadow-blue-600/30 transition-all"
          >
            <span>Go to My Dedicated Dashboard</span>
            <ArrowRight className="w-4 h-4" />
          </button>

          <button
            onClick={() => navigate('/')}
            className="w-full py-2.5 rounded-2xl text-xs font-semibold text-slate-400 hover:text-white hover:bg-slate-800/60 flex items-center justify-center gap-1.5 transition-all"
          >
            <Home className="w-3.5 h-3.5" />
            <span>Return to Public Home</span>
          </button>
        </div>
      </div>
    </div>
  );
};

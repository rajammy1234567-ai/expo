import React from 'react';
import { useAuth } from '../context/AuthContext';
import { ShieldAlert, ArrowRight, Lock } from 'lucide-react';

interface ProtectedRouteProps {
  allowedRoles: string[];
  children: React.ReactNode;
  onNavigateHome: () => void;
}

export const ProtectedRoute: React.FC<ProtectedRouteProps> = ({
  allowedRoles,
  children,
  onNavigateHome,
}) => {
  const { user, loading, role } = useAuth();

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[50vh] space-y-3">
        <div className="w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
        <p className="text-xs text-slate-400">Verifying security permissions...</p>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="max-w-md mx-auto my-16 p-8 rounded-3xl bg-slate-900 border border-slate-800 text-center space-y-4 shadow-2xl">
        <div className="w-14 h-14 mx-auto rounded-2xl bg-amber-500/20 border border-amber-500/30 flex items-center justify-center text-amber-400">
          <Lock className="w-7 h-7" />
        </div>
        <div>
          <h2 className="text-lg font-black text-white font-['Outfit']">Authentication Required</h2>
          <p className="text-xs text-slate-400 mt-1">
            Please sign in to access this portal area.
          </p>
        </div>
        <button
          onClick={onNavigateHome}
          className="w-full py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold transition-all"
        >
          Return to Expo Floor
        </button>
      </div>
    );
  }

  const userRole = user.role;
  const isAuthorized = allowedRoles.includes(userRole);

  if (!isAuthorized) {
    return (
      <div className="max-w-lg mx-auto my-16 p-8 rounded-3xl bg-slate-900 border border-red-500/30 text-center space-y-5 shadow-2xl">
        <div className="w-16 h-16 mx-auto rounded-2xl bg-red-500/20 border border-red-500/40 flex items-center justify-center text-red-400">
          <ShieldAlert className="w-8 h-8" />
        </div>
        <div>
          <span className="text-[10px] font-bold uppercase tracking-wider bg-red-500/20 text-red-400 px-2 py-0.5 rounded-full border border-red-500/30">
            403 Forbidden
          </span>
          <h2 className="text-xl font-black text-white font-['Outfit'] mt-2">
            Access Denied — Role Restricted
          </h2>
          <p className="text-xs text-slate-300 mt-1">
            This module requires authorization for: <strong className="text-white">{allowedRoles.join(' or ')}</strong>.
          </p>
          <div className="mt-3 p-3 rounded-xl bg-slate-950 border border-slate-800 text-xs text-slate-400">
            Your current logged-in role is: <strong className="text-amber-400">{userRole}</strong> ({user.name})
          </div>
        </div>

        <button
          onClick={onNavigateHome}
          className="w-full py-3 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white text-xs font-bold flex items-center justify-center gap-2 shadow-lg shadow-blue-600/30 transition-all"
        >
          <span>Go To My Authorized Dashboard</span>
          <ArrowRight className="w-4 h-4" />
        </button>
      </div>
    );
  }

  return <>{children}</>;
};

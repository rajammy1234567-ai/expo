import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Sparkles } from 'lucide-react';

interface RequireAuthProps {
  children: React.ReactNode;
  allowedRoles?: Array<'INVESTOR' | 'BRAND_ADMIN' | 'VIZ_ADMIN'>;
}

export const RequireAuth: React.FC<RequireAuthProps> = ({ children, allowedRoles }) => {
  const { user, loading, role } = useAuth();
  const location = useLocation();

  if (loading) {
    return (
      <div className="min-h-screen bg-[#07090e] flex flex-col items-center justify-center space-y-4 text-white">
        <div className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-blue-600 via-indigo-500 to-amber-400 flex items-center justify-center font-black text-2xl animate-pulse shadow-xl shadow-blue-500/20">
          V
        </div>
        <div className="flex items-center gap-2 text-xs font-semibold text-slate-400">
          <Sparkles className="w-4 h-4 text-blue-400 animate-spin" />
          <span>Verifying VIZ credentials...</span>
        </div>
      </div>
    );
  }

  // Not authenticated -> redirect to landing page and instruct it to open sign in modal
  if (!user) {
    return <Navigate to="/" state={{ openSignIn: true, returnTo: location.pathname }} replace />;
  }

  // Authenticated but unauthorized role -> redirect to unauthorized view
  if (allowedRoles && role && !allowedRoles.includes(role)) {
    return <Navigate to="/unauthorized" state={{ attemptedPath: location.pathname, currentRole: role }} replace />;
  }

  return <>{children}</>;
};

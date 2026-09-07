import React, { useState, useEffect } from 'react';
import { BrowserRouter, Routes, Route, Navigate, useNavigate, useLocation } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import { Navbar } from './components/Navbar';
import { RequireAuth } from './components/RequireAuth';
import { LoginModal } from './components/LoginModal';
import { PublicLandingView } from './pages/PublicLandingView';
import { InvestorExpoView } from './pages/InvestorExpoView';
import { BrandDetailView } from './pages/BrandDetailView';
import { BrandPortalView } from './pages/BrandPortalView';
import { AdminDashboardView } from './pages/AdminDashboardView';
import { MyDealsView } from './pages/MyDealsView';
import { MyMeetingsView } from './pages/MyMeetingsView';
import { UnauthorizedView } from './pages/UnauthorizedView';
import { AIAssistantModal } from './components/AIAssistantModal';
import { MeetingRequestModal } from './components/MeetingRequestModal';
import { CompareModal } from './components/CompareModal';
import { InvestorProfileSetupModal } from './components/InvestorProfileSetupModal';
import { IBrand } from './types';

const MainApp: React.FC = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  // Modals state
  const [showLoginModal, setShowLoginModal] = useState(false);
  const [loginPreferredRole, setLoginPreferredRole] = useState<'INVESTOR' | 'BRAND'>('INVESTOR');
  const [loginInitialMode, setLoginInitialMode] = useState<'login' | 'register'>('login');

  const [selectedBrand, setSelectedBrand] = useState<IBrand | null>(null);
  const [aiModalBrand, setAiModalBrand] = useState<IBrand | null>(null);
  const [meetingModalBrand, setMeetingModalBrand] = useState<IBrand | null>(null);
  const [showCompareModal, setShowCompareModal] = useState(false);
  const [showProfileSetup, setShowProfileSetup] = useState(false);

  // Clear brand detail view whenever route path changes
  useEffect(() => {
    setSelectedBrand(null);
  }, [location.pathname]);

  // Open login modal automatically if redirected from RequireAuth
  useEffect(() => {
    if (location.state && (location.state as any).openSignIn) {
      setLoginInitialMode('login');
      setShowLoginModal(true);
    }
  }, [location.state]);

  const handleLoginSuccess = (selectedRole: string) => {
    setShowLoginModal(false);
    const returnTo = (location.state as any)?.returnTo;
    if (returnTo && returnTo !== '/' && returnTo !== '/unauthorized') {
      navigate(returnTo);
    } else {
      const roleUpper = (selectedRole || '').toUpperCase();
      if (roleUpper === 'ADMIN' || roleUpper === 'VIZ_ADMIN') {
        navigate('/admin-dashboard');
      } else if (roleUpper === 'BRAND' || roleUpper === 'BRAND_ADMIN') {
        navigate('/brand-portal');
      } else {
        navigate('/expo-floor');
      }
    }
  };

  const handleOpenLogin = (preferredRole?: 'INVESTOR' | 'BRAND', mode: 'login' | 'register' = 'login') => {
    if (preferredRole) setLoginPreferredRole(preferredRole);
    setLoginInitialMode(mode);
    setShowLoginModal(true);
  };

  return (
    <div className="min-h-screen bg-[#07090e] text-slate-100 flex flex-col font-sans">
      {/* Top Navigation Bar */}
      <Navbar
        onOpenCompare={() => setShowCompareModal(true)}
        onOpenProfileSetup={() => setShowProfileSetup(true)}
        onOpenLoginModal={() => handleOpenLogin('INVESTOR', 'login')}
      />

      {/* Main Content Area */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 pt-6">
        {selectedBrand ? (
          <BrandDetailView
            brand={selectedBrand}
            onBack={() => setSelectedBrand(null)}
            onOpenAI={(b) => setAiModalBrand(b)}
            onOpenMeeting={(b) => setMeetingModalBrand(b)}
          />
        ) : (
          <Routes>
            {/* 1. Public Landing Page at '/' */}
            <Route
              path="/"
              element={
                <PublicLandingView
                  onOpenLogin={(role) => handleOpenLogin(role, role ? 'register' : 'login')}
                  onOpenBrandDetails={(b) => setSelectedBrand(b)}
                />
              }
            />

            {/* 2. Protected Expo Floor (Investor & Admin) */}
            <Route
              path="/expo-floor"
              element={
                <RequireAuth allowedRoles={['INVESTOR', 'VIZ_ADMIN']}>
                  <InvestorExpoView
                    onOpenAI={(b) => setAiModalBrand(b)}
                    onOpenMeeting={(b) => setMeetingModalBrand(b)}
                    onOpenDetails={(b) => setSelectedBrand(b)}
                    onOpenProfileSetup={() => setShowProfileSetup(true)}
                  />
                </RequireAuth>
              }
            />

            {/* 3. Protected Brand Portal & CRM */}
            <Route
              path="/brand-portal"
              element={
                <RequireAuth allowedRoles={['BRAND_ADMIN', 'VIZ_ADMIN']}>
                  <BrandPortalView />
                </RequireAuth>
              }
            />

            {/* 4. Protected Platform Admin Command Center */}
            <Route
              path="/admin-dashboard"
              element={
                <RequireAuth allowedRoles={['VIZ_ADMIN']}>
                  <AdminDashboardView />
                </RequireAuth>
              }
            />

            {/* 5. Protected Deal Pipelines */}
            <Route
              path="/deals"
              element={
                <RequireAuth allowedRoles={['INVESTOR', 'BRAND_ADMIN', 'VIZ_ADMIN']}>
                  <MyDealsView />
                </RequireAuth>
              }
            />

            {/* 6. Protected Meeting Schedules */}
            <Route
              path="/meetings"
              element={
                <RequireAuth allowedRoles={['INVESTOR', 'BRAND_ADMIN', 'VIZ_ADMIN']}>
                  <MyMeetingsView />
                </RequireAuth>
              }
            />

            {/* 7. Dedicated 403 Forbidden Page */}
            <Route path="/unauthorized" element={<UnauthorizedView />} />

            {/* 8. Fallback: Unknown routes redirect to '/' */}
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        )}
      </main>

      {/* Account Login / Registration Modal */}
      <LoginModal
        isOpen={showLoginModal}
        onClose={() => setShowLoginModal(false)}
        onSuccess={handleLoginSuccess}
        initialMode={loginInitialMode}
        initialRole={loginPreferredRole}
      />

      {/* Grounded Brand AI Assistant Modal */}
      {aiModalBrand && (
        <AIAssistantModal
          brand={aiModalBrand}
          onClose={() => setAiModalBrand(null)}
          onRequestMeeting={(b) => {
            setAiModalBrand(null);
            setMeetingModalBrand(b);
          }}
        />
      )}

      {/* Live Discovery Meeting Request Modal */}
      {meetingModalBrand && (
        <MeetingRequestModal
          brand={meetingModalBrand}
          onClose={() => setMeetingModalBrand(null)}
          onSuccess={() => {
            setMeetingModalBrand(null);
            navigate('/meetings');
          }}
        />
      )}

      {/* Multi-Brand Comparison Matrix (2 to 4 brands) */}
      {showCompareModal && (
        <CompareModal
          onClose={() => setShowCompareModal(false)}
          onOpenAI={(b) => {
            setShowCompareModal(false);
            setAiModalBrand(b);
          }}
          onOpenMeeting={(b) => {
            setShowCompareModal(false);
            setMeetingModalBrand(b);
          }}
        />
      )}

      {/* Investor 5-Step AI Matchmaking Profile Setup */}
      {showProfileSetup && (
        <InvestorProfileSetupModal
          onClose={() => setShowProfileSetup(false)}
          onSaved={() => {
            setShowProfileSetup(false);
            navigate('/expo-floor');
          }}
        />
      )}
    </div>
  );
};

export function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <MainApp />
      </AuthProvider>
    </BrowserRouter>
  );
}

export default App;

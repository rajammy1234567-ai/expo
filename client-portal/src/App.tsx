import React, { useState, useEffect } from 'react';
import { BrowserRouter, Routes, Route, Navigate, useNavigate, useLocation } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import { SocketProvider } from './context/SocketContext';
import { Navbar } from './components/Navbar';
import { RequireAuth } from './components/RequireAuth';
import { LoginModal } from './components/LoginModal';
import { HomeLandingView } from './pages/HomeLandingView';
import { AuthLandingView } from './pages/AuthLandingView';
import { PublicLandingView } from './pages/PublicLandingView';
import { InvestorExpoView } from './pages/InvestorExpoView';
import { BrandDetailView } from './pages/BrandDetailView';
import { BrandPortalView } from './pages/BrandPortalView';
import { AdminDashboardView } from './pages/AdminDashboardView';
import { MyDealsView } from './pages/MyDealsView';
import { MyMeetingsView } from './pages/MyMeetingsView';
import { ChatInboxView } from './pages/ChatInboxView';
import { UnauthorizedView } from './pages/UnauthorizedView';
import { ChatModal } from './components/ChatModal';
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
  const [chatModalBrand, setChatModalBrand] = useState<IBrand | null>(null);
  const [meetingModalBrand, setMeetingModalBrand] = useState<IBrand | null>(null);
  const [showCompareModal, setShowCompareModal] = useState(false);
  const [showProfileSetup, setShowProfileSetup] = useState(false);
  const [pendingAction, setPendingAction] = useState<{ type: 'CHAT' | 'MEETING'; brand: IBrand } | null>(null);

  // Clear brand detail view whenever route path changes
  useEffect(() => {
    setSelectedBrand(null);
  }, [location.pathname]);

  // Open login modal automatically if redirected from RequireAuth when targeting protected route
  useEffect(() => {
    if (location.state && (location.state as any).openSignIn && location.pathname !== '/') {
      setLoginInitialMode('login');
      setShowLoginModal(true);
    }
  }, [location.state, location.pathname]);

  const getHomeRouteForRole = (userRole?: string) => {
    const roleUpper = (userRole || '').toUpperCase();
    if (roleUpper === 'ADMIN' || roleUpper === 'VIZ_ADMIN') {
      return '/admin-dashboard';
    } else if (roleUpper === 'BRAND' || roleUpper === 'BRAND_ADMIN') {
      return '/brand-portal';
    }
    return '/expo-floor';
  };

  const handleTriggerChat = (brand: IBrand) => {
    if (!user) {
      setPendingAction({ type: 'CHAT', brand });
      setShowLoginModal(true);
      return;
    }
    setChatModalBrand(brand);
  };

  const handleTriggerMeeting = (brand: IBrand) => {
    if (!user) {
      setPendingAction({ type: 'MEETING', brand });
      setShowLoginModal(true);
      return;
    }
    setMeetingModalBrand(brand);
  };

  const handleLoginSuccess = (selectedRole: string) => {
    setShowLoginModal(false);

    // If user triggered an action as a guest, fulfill it immediately without dumping them to homepage!
    if (pendingAction) {
      const action = pendingAction;
      setPendingAction(null);
      if (action.type === 'CHAT') {
        setChatModalBrand(action.brand);
      } else if (action.type === 'MEETING') {
        setMeetingModalBrand(action.brand);
      }
      return;
    }

    // If user is currently inspecting a brand detail, preserve the view
    if (selectedBrand) {
      return;
    }

    const returnTo = (location.state as any)?.returnTo;
    if (returnTo && returnTo !== '/' && returnTo !== '/unauthorized') {
      navigate(returnTo);
    } else {
      navigate(getHomeRouteForRole(selectedRole));
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
            onOpenChat={handleTriggerChat}
            onOpenMeeting={handleTriggerMeeting}
          />
        ) : (
          <Routes>
            {/* 1. Grand B2B Marketplace Home & Landing Page at '/' */}
            <Route
              path="/"
              element={
                <HomeLandingView
                  onSuccess={handleLoginSuccess}
                  onOpenBrandDetails={(b) => setSelectedBrand(b)}
                  onOpenChat={handleTriggerChat}
                  onOpenMeeting={handleTriggerMeeting}
                  onOpenLoginModal={() => handleOpenLogin('INVESTOR', 'login')}
                />
              }
            />

            {/* Public Expo Preview Mode for Guest Browsing */}
            <Route
              path="/preview"
              element={
                <PublicLandingView
                  onOpenLogin={(role) => handleOpenLogin(role, role ? 'register' : 'login')}
                  onOpenBrandDetails={(b) => setSelectedBrand(b)}
                />
              }
            />

            {/* 2. Expo Floor (Open for Guests, Investors, & Admin) */}
            <Route
              path="/expo-floor"
              element={
                <InvestorExpoView
                  onOpenChat={handleTriggerChat}
                  onOpenMeeting={handleTriggerMeeting}
                  onOpenDetails={(b) => setSelectedBrand(b)}
                  onOpenProfileSetup={() => setShowProfileSetup(true)}
                />
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

            {/* 7. Protected Direct Messaging Inbox */}
            <Route
              path="/chats"
              element={
                <RequireAuth allowedRoles={['INVESTOR', 'BRAND_ADMIN', 'VIZ_ADMIN']}>
                  <ChatInboxView />
                </RequireAuth>
              }
            />
            <Route
              path="/chats/:conversationId"
              element={
                <RequireAuth allowedRoles={['INVESTOR', 'BRAND_ADMIN', 'VIZ_ADMIN']}>
                  <ChatInboxView />
                </RequireAuth>
              }
            />

            {/* 8. Dedicated 403 Forbidden Page */}
            <Route path="/unauthorized" element={<UnauthorizedView />} />

            {/* 9. Fallback: Unknown routes redirect to '/' */}
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

      {/* Real-Time 1-on-1 Direct Chat Modal (Photos + Typing + Presence) */}
      {chatModalBrand && (
        <ChatModal
          isOpen={!!chatModalBrand}
          brand={chatModalBrand}
          onClose={() => setChatModalBrand(null)}
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
          onOpenChat={(b) => {
            setShowCompareModal(false);
            setChatModalBrand(b);
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
        <SocketProvider>
          <MainApp />
        </SocketProvider>
      </AuthProvider>
    </BrowserRouter>
  );
}

export default App;

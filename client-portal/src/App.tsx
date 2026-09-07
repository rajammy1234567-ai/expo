import React, { useState, useEffect } from 'react';
import { AuthProvider, useAuth } from './context/AuthContext';
import { Navbar } from './components/Navbar';
import { ProtectedRoute } from './components/ProtectedRoute';
import { LoginModal } from './components/LoginModal';
import { InvestorExpoView } from './pages/InvestorExpoView';
import { BrandDetailView } from './pages/BrandDetailView';
import { BrandPortalView } from './pages/BrandPortalView';
import { AdminDashboardView } from './pages/AdminDashboardView';
import { MyDealsView } from './pages/MyDealsView';
import { MyMeetingsView } from './pages/MyMeetingsView';
import { AIAssistantModal } from './components/AIAssistantModal';
import { MeetingRequestModal } from './components/MeetingRequestModal';
import { CompareModal } from './components/CompareModal';
import { InvestorProfileSetupModal } from './components/InvestorProfileSetupModal';
import { IBrand } from './types';

const MainApp: React.FC = () => {
  const { user, activePersona } = useAuth();
  const [currentTab, setCurrentTab] = useState<'expo' | 'brand-portal' | 'admin-center' | 'my-deals' | 'my-meetings'>('expo');
  const [selectedBrand, setSelectedBrand] = useState<IBrand | null>(null);

  // Modals state
  const [showLoginModal, setShowLoginModal] = useState(false);
  const [aiModalBrand, setAiModalBrand] = useState<IBrand | null>(null);
  const [meetingModalBrand, setMeetingModalBrand] = useState<IBrand | null>(null);
  const [showCompareModal, setShowCompareModal] = useState(false);
  const [showProfileSetup, setShowProfileSetup] = useState(false);

  // When active persona/role changes, auto-route to the appropriate default view
  useEffect(() => {
    setSelectedBrand(null);
    if (activePersona === 'ADMIN') {
      setCurrentTab('admin-center');
    } else if (activePersona === 'BRAND') {
      setCurrentTab('brand-portal');
    } else {
      setCurrentTab('expo');
    }
  }, [activePersona]);

  const getDefaultTabForRole = () => {
    if (activePersona === 'ADMIN') return 'admin-center';
    if (activePersona === 'BRAND') return 'brand-portal';
    return 'expo';
  };

  return (
    <div className="min-h-screen bg-[#07090e] text-slate-100 flex flex-col font-sans">
      {/* Top Navbar */}
      <Navbar
        currentTab={currentTab}
        setCurrentTab={(tab) => {
          setSelectedBrand(null);
          setCurrentTab(tab);
        }}
        onOpenCompare={() => setShowCompareModal(true)}
        onOpenProfileSetup={() => setShowProfileSetup(true)}
        onOpenLoginModal={() => setShowLoginModal(true)}
      />

      {/* Main Content Container */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 pt-6">
        {selectedBrand ? (
          <BrandDetailView
            brand={selectedBrand}
            onBack={() => setSelectedBrand(null)}
            onOpenAI={(b) => setAiModalBrand(b)}
            onOpenMeeting={(b) => setMeetingModalBrand(b)}
          />
        ) : (
          <>
            {/* Public/Investor Expo Floor */}
            {currentTab === 'expo' && (
              <InvestorExpoView
                onOpenAI={(b) => setAiModalBrand(b)}
                onOpenMeeting={(b) => setMeetingModalBrand(b)}
                onOpenDetails={(b) => setSelectedBrand(b)}
                onOpenProfileSetup={() => setShowProfileSetup(true)}
              />
            )}

            {/* Protected Brand Portal & CRM */}
            {currentTab === 'brand-portal' && (
              <ProtectedRoute
                allowedRoles={['BRAND_ADMIN', 'VIZ_ADMIN']}
                onNavigateHome={() => setCurrentTab(getDefaultTabForRole())}
              >
                <BrandPortalView />
              </ProtectedRoute>
            )}

            {/* Protected Super Admin Command Center */}
            {currentTab === 'admin-center' && (
              <ProtectedRoute
                allowedRoles={['VIZ_ADMIN']}
                onNavigateHome={() => setCurrentTab(getDefaultTabForRole())}
              >
                <AdminDashboardView />
              </ProtectedRoute>
            )}

            {/* Protected Investor Deals */}
            {currentTab === 'my-deals' && (
              <ProtectedRoute
                allowedRoles={['INVESTOR']}
                onNavigateHome={() => setCurrentTab(getDefaultTabForRole())}
              >
                <MyDealsView />
              </ProtectedRoute>
            )}

            {/* Protected Investor Scheduled Meetings */}
            {currentTab === 'my-meetings' && (
              <ProtectedRoute
                allowedRoles={['INVESTOR']}
                onNavigateHome={() => setCurrentTab(getDefaultTabForRole())}
              >
                <MyMeetingsView />
              </ProtectedRoute>
            )}
          </>
        )}
      </main>

      {/* Account Login / Registration Modal */}
      <LoginModal
        isOpen={showLoginModal}
        onClose={() => setShowLoginModal(false)}
        onSuccess={(selectedRole) => {
          const roleUpper = (selectedRole || '').toUpperCase();
          if (roleUpper === 'ADMIN' || roleUpper === 'VIZ_ADMIN') setCurrentTab('admin-center');
          else if (roleUpper === 'BRAND' || roleUpper === 'BRAND_ADMIN') setCurrentTab('brand-portal');
          else setCurrentTab('expo');
        }}
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
            setCurrentTab('my-meetings');
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
            setCurrentTab('expo');
          }}
        />
      )}
    </div>
  );
};

export function App() {
  return (
    <AuthProvider>
      <MainApp />
    </AuthProvider>
  );
}

export default App;

import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { authApi } from '../services/api';
import { VizLogo } from '../components/VizLogo';
import {
  Sparkles,
  ShieldCheck,
  Building2,
  UserCircle,
  ArrowRight,
  Phone,
  Mail,
  Lock,
  Eye,
  EyeOff,
  CheckCircle2,
  AlertCircle,
  TrendingUp,
  Award,
  Layers,
  Cpu,
  Zap,
  ChevronRight,
  Globe,
  Compass,
} from 'lucide-react';

interface AuthLandingViewProps {
  onSuccess?: (role: string) => void;
  onExploreGuest?: () => void;
}

export const AuthLandingView: React.FC<AuthLandingViewProps> = ({
  onSuccess,
  onExploreGuest,
}) => {
  const navigate = useNavigate();
  const { loginWithRole, loginWithPassword, registerUser, verifyOTPCode } = useAuth();

  // Live Platform Stats
  const [platformStats, setPlatformStats] = useState<any>({
    totalGMV: 5500000,
    verifiedBrands: 6,
    totalInvestors: 142,
    closedDeals: 2,
  });

  // Tab State: 'demo' | 'otp' | 'email' | 'register'
  const [activeTab, setActiveTab] = useState<'demo' | 'otp' | 'email' | 'register'>('demo');

  // Form States
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  const [phone, setPhone] = useState('+91 98888 12345');
  const [otpRole, setOtpRole] = useState<'INVESTOR' | 'BRAND'>('INVESTOR');
  const [otpStep, setOtpStep] = useState(false);
  const [otpCode, setOtpCode] = useState('');
  const [devOtpHint, setDevOtpHint] = useState<string | null>(null);
  const [resendCooldown, setResendCooldown] = useState(0);

  // Registration states
  const [regName, setRegName] = useState('');
  const [regEmail, setRegEmail] = useState('');
  const [regPhone, setRegPhone] = useState('+91 ');
  const [regRole, setRegRole] = useState<'INVESTOR' | 'BRAND'>('INVESTOR');
  const [regPassword, setRegPassword] = useState('');
  const [regConfirmPassword, setRegConfirmPassword] = useState('');

  // Status
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [successToast, setSuccessToast] = useState('');

  // Load live statistics from backend
  useEffect(() => {
    const fetchStats = async () => {
      try {
        const res = await authApi.getStats();
        if (res.data?.success && res.data?.stats) {
          setPlatformStats(res.data.stats);
        }
      } catch (err) {
        console.warn('Could not load live stats, using fallback', err);
      }
    };
    fetchStats();
  }, []);

  // Cooldown countdown timer for OTP resend
  useEffect(() => {
    if (resendCooldown > 0) {
      const timer = setTimeout(() => setResendCooldown(resendCooldown - 1), 1000);
      return () => clearTimeout(timer);
    }
  }, [resendCooldown]);

  const handleRouteRedirect = (targetRole: string) => {
    const roleUpper = (targetRole || '').toUpperCase();
    if (onSuccess) {
      onSuccess(roleUpper);
    } else {
      if (roleUpper === 'ADMIN' || roleUpper === 'VIZ_ADMIN') {
        navigate('/admin-dashboard');
      } else if (roleUpper === 'BRAND' || roleUpper === 'BRAND_ADMIN') {
        navigate('/brand-portal');
      } else {
        navigate('/expo-floor');
      }
    }
  };

  // 1-Click Demo Login
  const handleQuickDemo = async (role: 'INVESTOR' | 'BRAND' | 'ADMIN') => {
    setLoading(true);
    setErrorMsg('');
    try {
      await loginWithRole(role);
      setSuccessToast(`Welcome! Logged in as ${role === 'ADMIN' ? 'Platform Super Admin' : role === 'BRAND' ? 'Franchise Partner' : 'Investor'}`);
      setTimeout(() => {
        handleRouteRedirect(role);
      }, 500);
    } catch (err: any) {
      setErrorMsg(err.message || 'Quick demo login failed.');
    } finally {
      setLoading(false);
    }
  };

  // Request Mobile OTP
  const handleRequestOtp = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!phone || phone.length < 10) {
      setErrorMsg('Please provide a valid 10-digit mobile number.');
      return;
    }
    setLoading(true);
    setErrorMsg('');
    try {
      const res = await authApi.requestOtp(phone);
      setLoading(false);
        if (res.data.success) {
          setOtpStep(true);
          setResendCooldown(30);
          const code = res.data.devOtp || res.data.otpDemo || '123456';
          setDevOtpHint(code);
          setOtpCode(code);
        } else {
          setErrorMsg('Could not send OTP. Please try demo login.');
        }
      } catch (err: any) {
        setLoading(false);
        setErrorMsg(err.message || 'Error requesting OTP.');
      }
    };

  // Verify OTP
  const handleVerifyOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!otpCode || otpCode.length < 4) {
      setErrorMsg('Please enter the 6-digit OTP.');
      return;
    }
    setLoading(true);
    setErrorMsg('');
    const res = await verifyOTPCode({
      phone,
      otp: otpCode,
      role: otpRole,
    });
    setLoading(false);
    if (res.success) {
      setSuccessToast('OTP verified successfully!');
      setTimeout(() => {
        handleRouteRedirect(res.role || 'INVESTOR');
      }, 500);
    } else {
      setErrorMsg(res.message || 'Invalid or expired OTP code.');
    }
  };

  // Email Password Login
  const handleEmailLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) {
      setErrorMsg('Please enter both email and password.');
      return;
    }
    setLoading(true);
    setErrorMsg('');
    const res = await loginWithPassword(email, password);
    setLoading(false);
    if (res.success) {
      setSuccessToast(res.message || 'Login successful!');
      setTimeout(() => {
        handleRouteRedirect(res.role || 'INVESTOR');
      }, 500);
    } else {
      setErrorMsg(res.message || 'Invalid email credentials.');
    }
  };

  // Registration Submit
  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    if (regPassword !== regConfirmPassword) {
      setErrorMsg('Passwords do not match.');
      return;
    }
    setLoading(true);
    setErrorMsg('');
    const res = await registerUser({
      name: regName,
      email: regEmail,
      phone: regPhone,
      role: regRole,
      password: regPassword,
      confirmPassword: regConfirmPassword,
    });
    setLoading(false);
    if (res.success) {
      setSuccessToast('Registration complete! Directing you in...');
      setTimeout(() => {
        handleRouteRedirect(regRole);
      }, 700);
    } else {
      setErrorMsg(res.message || 'Registration failed.');
    }
  };

  return (
    <div className="relative min-h-[calc(100vh-5rem)] -mx-4 sm:-mx-6 lg:-mx-8 -mt-6 px-4 py-8 sm:p-10 flex flex-col justify-center overflow-hidden bg-[#07090e]">
      {/* Dynamic Ambient Background Elements */}
      <div className="absolute top-0 left-1/4 w-96 h-96 bg-blue-600/15 rounded-full blur-3xl pointer-events-none -translate-y-1/2 animate-pulse" />
      <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-indigo-600/15 rounded-full blur-3xl pointer-events-none translate-y-1/2" />
      <div className="absolute top-1/2 right-10 w-72 h-72 bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />

      {/* Subtle Mesh Grid Pattern */}
      <div
        className="absolute inset-0 pointer-events-none opacity-[0.03]"
        style={{
          backgroundImage:
            'radial-gradient(#ffffff 1px, transparent 1px), radial-gradient(#ffffff 1px, #07090e 1px)',
          backgroundSize: '40px 40px',
        }}
      />

      <div className="relative z-10 max-w-7xl w-full mx-auto space-y-10">
        {/* Top Launch Header & Branding */}
        <div className="text-center space-y-4 max-w-3xl mx-auto">
          {/* Logo with Ambient Aura */}
          <div className="flex justify-center pb-1">
            <VizLogo size="hero" animate={true} />
          </div>

          {/* Platform Status Badge */}
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-slate-900/90 border border-slate-700/60 shadow-lg text-xs">
            <span className="flex h-2 w-2 rounded-full bg-emerald-400 animate-pulse" />
            <span className="font-semibold text-white tracking-wide uppercase">
              India's 24/7 Digital B2B Franchise Marketplace
            </span>
            <span className="text-slate-500">|</span>
            <span className="text-cyan-400 font-medium">Enterprise Edition</span>
          </div>

          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-black text-white tracking-tight font-['Outfit']">
            Step Straight Into the Future of{' '}
            <span className="bg-clip-text text-transparent bg-gradient-to-r from-blue-400 via-indigo-300 to-amber-300">
              Franchise Expansion
            </span>
          </h1>

          <p className="text-slate-400 text-sm sm:text-base max-w-2xl mx-auto">
            Experience verified virtual expo booths, query grounded AI unit economics,
            and execute bank-grade escrow commitments. Sign in below to enter your workspace.
          </p>

          {/* Live Dynamic Stats Bar */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 max-w-4xl mx-auto pt-2">
            <div className="p-3.5 rounded-2xl bg-slate-900/90 border border-slate-800 backdrop-blur-md shadow-lg text-center">
              <span className="text-[11px] text-slate-400 font-semibold block">Total Facilitated GMV</span>
              <p className="text-xl font-black text-amber-400">
                ₹{((platformStats.totalGMV || 5500000) / 100000).toFixed(1)} Lakh
              </p>
              <span className="text-[10px] text-emerald-400 font-medium">● Live Deal Volume</span>
            </div>
            <div className="p-3.5 rounded-2xl bg-slate-900/90 border border-slate-800 backdrop-blur-md shadow-lg text-center">
              <span className="text-[11px] text-slate-400 font-semibold block">Verified Franchises</span>
              <p className="text-xl font-black text-white">
                {platformStats.verifiedBrands || 6} Brands
              </p>
              <span className="text-[10px] text-blue-400 font-medium">● 100% Vetted KYC</span>
            </div>
            <div className="p-3.5 rounded-2xl bg-slate-900/90 border border-slate-800 backdrop-blur-md shadow-lg text-center">
              <span className="text-[11px] text-slate-400 font-semibold block">Active Investors</span>
              <p className="text-xl font-black text-white">
                {platformStats.totalInvestors || 142} Registered
              </p>
              <span className="text-[10px] text-purple-400 font-medium">● Qualified Buyers</span>
            </div>
            <div className="p-3.5 rounded-2xl bg-slate-900/90 border border-slate-800 backdrop-blur-md shadow-lg text-center">
              <span className="text-[11px] text-slate-400 font-semibold block">Executed Agreements</span>
              <p className="text-xl font-black text-emerald-400">
                {platformStats.closedDeals || 2} Deals
              </p>
              <span className="text-[10px] text-teal-400 font-medium">● 3% Escrow Settled</span>
            </div>
          </div>
        </div>

        {/* Unified Application Launch Stage (Dual Column) */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* Left Column: Live Platform Highlights & Brand Showcase */}
          <div className="lg:col-span-6 space-y-6">
            {/* Core Capability Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="p-4 rounded-2xl bg-slate-900/70 border border-slate-800 backdrop-blur-md hover:border-blue-500/30 transition-all group">
                <div className="w-10 h-10 rounded-xl bg-blue-500/10 border border-blue-500/20 flex items-center justify-center text-blue-400 mb-3 group-hover:scale-105 transition-transform">
                  <Compass className="w-5 h-5" />
                </div>
                <h3 className="text-base font-bold text-white mb-1">24/7 Virtual Expo Floor</h3>
                <p className="text-xs text-slate-400 leading-relaxed">
                  Walk 3D booths, stream high-definition brand reels, and explore vetted P&L unit models anytime.
                </p>
              </div>

              <div className="p-4 rounded-2xl bg-slate-900/70 border border-slate-800 backdrop-blur-md hover:border-indigo-500/30 transition-all group">
                <div className="w-10 h-10 rounded-xl bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center text-indigo-400 mb-3 group-hover:scale-105 transition-transform">
                  <Cpu className="w-5 h-5" />
                </div>
                <h3 className="text-base font-bold text-white mb-1">Grounded Brand AI</h3>
                <p className="text-xs text-slate-400 leading-relaxed">
                  Ask nuanced questions regarding Capex, royalties, payback months, and break-even footfall.
                </p>
              </div>

              <div className="p-4 rounded-2xl bg-slate-900/70 border border-slate-800 backdrop-blur-md hover:border-purple-500/30 transition-all group">
                <div className="w-10 h-10 rounded-xl bg-purple-500/10 border border-purple-500/20 flex items-center justify-center text-purple-400 mb-3 group-hover:scale-105 transition-transform">
                  <ShieldCheck className="w-5 h-5" />
                </div>
                <h3 className="text-base font-bold text-white mb-1">Escrow Token Security</h3>
                <p className="text-xs text-slate-400 leading-relaxed">
                  Lock territory exclusivity via instant legal term sheet generation and banking escrow tokens.
                </p>
              </div>

              <div className="p-4 rounded-2xl bg-slate-900/70 border border-slate-800 backdrop-blur-md hover:border-amber-500/30 transition-all group">
                <div className="w-10 h-10 rounded-xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-400 mb-3 group-hover:scale-105 transition-transform">
                  <TrendingUp className="w-5 h-5" />
                </div>
                <h3 className="text-base font-bold text-white mb-1">Live Deal Tracker</h3>
                <p className="text-xs text-slate-400 leading-relaxed">
                  Full visibility for brand franchisors, investors, and platform administrators from lead to store launch.
                </p>
              </div>
            </div>

            {/* Trending Franchises Live Spotlight */}
            <div className="p-5 rounded-2xl bg-slate-900/60 border border-slate-800/80 backdrop-blur-md space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="flex h-2 w-2 rounded-full bg-emerald-400 animate-ping" />
                  <h4 className="text-xs font-bold uppercase tracking-wider text-slate-300">
                    Live Verified Opportunities
                  </h4>
                </div>
                <span className="text-[11px] text-cyan-400 font-medium">42 Brands Active</span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                <div className="p-2.5 rounded-xl bg-slate-950/70 border border-slate-800/80 flex items-center justify-between">
                  <div>
                    <p className="text-xs font-bold text-white">Chai Shai Express</p>
                    <p className="text-[10px] text-slate-400">F&B • 38-42% Margin</p>
                  </div>
                  <span className="text-xs font-bold text-amber-400">₹15L - ₹25L</span>
                </div>

                <div className="p-2.5 rounded-xl bg-slate-950/70 border border-slate-800/80 flex items-center justify-between">
                  <div>
                    <p className="text-xs font-bold text-white">Burger Singh</p>
                    <p className="text-[10px] text-slate-400">QSR • High Velocity</p>
                  </div>
                  <span className="text-xs font-bold text-amber-400">₹35L - ₹50L</span>
                </div>

                <div className="p-2.5 rounded-xl bg-slate-950/70 border border-slate-800/80 flex items-center justify-between">
                  <div>
                    <p className="text-xs font-bold text-white">Lenskart Partner</p>
                    <p className="text-[10px] text-slate-400">Retail • Zero Stock Risk</p>
                  </div>
                  <span className="text-xs font-bold text-amber-400">₹30L - ₹45L</span>
                </div>

                <div className="p-2.5 rounded-xl bg-slate-950/70 border border-slate-800/80 flex items-center justify-between">
                  <div>
                    <p className="text-xs font-bold text-white">DTDC Express</p>
                    <p className="text-[10px] text-slate-400">Logistics • Fast Payback</p>
                  </div>
                  <span className="text-xs font-bold text-amber-400">₹5L - ₹10L</span>
                </div>
              </div>

              {/* Guest Exploration Link */}
              <div className="pt-2 border-t border-slate-800/60 flex items-center justify-between text-xs">
                <span className="text-slate-400">Want to look around without signing in?</span>
                <button
                  type="button"
                  onClick={() => {
                    if (onExploreGuest) onExploreGuest();
                    else navigate('/expo-floor');
                  }}
                  className="text-cyan-400 hover:text-cyan-300 font-semibold flex items-center gap-1 group"
                >
                  <span>Preview Expo as Guest</span>
                  <ChevronRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
                </button>
              </div>
            </div>
          </div>

          {/* Right Column: Branded Interactive Sign-In Terminal */}
          <div className="lg:col-span-6">
            <div className="relative rounded-3xl bg-slate-900/90 border border-slate-800/90 shadow-2xl p-6 sm:p-8 backdrop-blur-xl">
              {/* Notification Toasts */}
              {errorMsg && (
                <div className="mb-4 p-3.5 rounded-xl bg-red-500/10 border border-red-500/30 text-red-400 text-xs flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 shrink-0" />
                  <span>{errorMsg}</span>
                </div>
              )}

              {successToast && (
                <div className="mb-4 p-3.5 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 shrink-0" />
                  <span>{successToast}</span>
                </div>
              )}

              {/* Terminal Title & Tabs */}
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <h2 className="text-xl font-bold text-white flex items-center gap-2">
                    <Zap className="w-5 h-5 text-amber-400" />
                    <span>Launch & Authentication Terminal</span>
                  </h2>
                  <span className="text-[11px] text-slate-400">Select Access Mode</span>
                </div>

                {/* Tab Switcher */}
                <div className="grid grid-cols-4 gap-1 p-1 bg-slate-950/80 rounded-xl border border-slate-800/80 text-xs">
                  <button
                    type="button"
                    onClick={() => {
                      setActiveTab('demo');
                      setErrorMsg('');
                    }}
                    className={`py-2 rounded-lg font-semibold transition-all flex items-center justify-center gap-1 ${
                      activeTab === 'demo'
                        ? 'bg-blue-600 text-white shadow-md shadow-blue-600/30'
                        : 'text-slate-400 hover:text-white'
                    }`}
                  >
                    <Sparkles className="w-3.5 h-3.5" />
                    <span>1-Click Demo</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      setActiveTab('otp');
                      setErrorMsg('');
                    }}
                    className={`py-2 rounded-lg font-semibold transition-all flex items-center justify-center gap-1 ${
                      activeTab === 'otp'
                        ? 'bg-blue-600 text-white shadow-md shadow-blue-600/30'
                        : 'text-slate-400 hover:text-white'
                    }`}
                  >
                    <Phone className="w-3.5 h-3.5" />
                    <span>Mobile OTP</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      setActiveTab('email');
                      setErrorMsg('');
                    }}
                    className={`py-2 rounded-lg font-semibold transition-all flex items-center justify-center gap-1 ${
                      activeTab === 'email'
                        ? 'bg-blue-600 text-white shadow-md shadow-blue-600/30'
                        : 'text-slate-400 hover:text-white'
                    }`}
                  >
                    <Mail className="w-3.5 h-3.5" />
                    <span>Email</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      setActiveTab('register');
                      setErrorMsg('');
                    }}
                    className={`py-2 rounded-lg font-semibold transition-all flex items-center justify-center gap-1 ${
                      activeTab === 'register'
                        ? 'bg-blue-600 text-white shadow-md shadow-blue-600/30'
                        : 'text-slate-400 hover:text-white'
                    }`}
                  >
                    <UserCircle className="w-3.5 h-3.5" />
                    <span>Register</span>
                  </button>
                </div>
              </div>

              {/* Tab Content 1: 1-Click Instant Demo Personas */}
              {activeTab === 'demo' && (
                <div className="mt-6 space-y-3.5">
                  <p className="text-xs text-slate-400">
                    Test the complete enterprise ecosystem instantly with zero passwords required:
                  </p>

                  {/* Investor Card */}
                  <div
                    onClick={() => handleQuickDemo('INVESTOR')}
                    className="p-4 rounded-2xl bg-gradient-to-r from-blue-950/40 via-slate-900 to-slate-900 border border-blue-500/30 hover:border-blue-400 hover:shadow-lg hover:shadow-blue-500/10 cursor-pointer transition-all flex items-center justify-between group"
                  >
                    <div className="flex items-center gap-3.5">
                      <div className="w-11 h-11 rounded-xl bg-blue-600/20 border border-blue-500/40 flex items-center justify-center text-blue-300 font-bold text-sm">
                        RS
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <h4 className="text-sm font-bold text-white group-hover:text-blue-300 transition-colors">
                            Rohit Sharma
                          </h4>
                          <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-blue-500/20 text-blue-300 border border-blue-500/30">
                            Investor
                          </span>
                        </div>
                        <p className="text-xs text-slate-400">
                          ₹50L Capital • Exploring F&B / Retail • Enter Expo Floor
                        </p>
                      </div>
                    </div>
                    <ArrowRight className="w-5 h-5 text-slate-500 group-hover:text-blue-400 group-hover:translate-x-1 transition-all" />
                  </div>

                  {/* Brand Franchisor Card */}
                  <div
                    onClick={() => handleQuickDemo('BRAND')}
                    className="p-4 rounded-2xl bg-gradient-to-r from-purple-950/40 via-slate-900 to-slate-900 border border-purple-500/30 hover:border-purple-400 hover:shadow-lg hover:shadow-purple-500/10 cursor-pointer transition-all flex items-center justify-between group"
                  >
                    <div className="flex items-center gap-3.5">
                      <div className="w-11 h-11 rounded-xl bg-purple-600/20 border border-purple-500/40 flex items-center justify-center text-purple-300 font-bold text-sm">
                        VS
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <h4 className="text-sm font-bold text-white group-hover:text-purple-300 transition-colors">
                            Vikram Sethi
                          </h4>
                          <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-purple-500/20 text-purple-300 border border-purple-500/30">
                            Brand Admin (Burger Blast)
                          </span>
                        </div>
                        <p className="text-xs text-slate-400">
                          franchise@burgerblast.in • Leads Kanban & Close Deals
                        </p>
                      </div>
                    </div>
                    <ArrowRight className="w-5 h-5 text-slate-500 group-hover:text-purple-400 group-hover:translate-x-1 transition-all" />
                  </div>

                  {/* Super Admin Card */}
                  <div
                    onClick={() => handleQuickDemo('ADMIN')}
                    className="p-4 rounded-2xl bg-gradient-to-r from-amber-950/40 via-slate-900 to-slate-900 border border-amber-500/30 hover:border-amber-400 hover:shadow-lg hover:shadow-amber-500/10 cursor-pointer transition-all flex items-center justify-between group"
                  >
                    <div className="flex items-center gap-3.5">
                      <div className="w-11 h-11 rounded-xl bg-amber-600/20 border border-amber-500/40 flex items-center justify-center text-amber-300 font-bold text-sm">
                        VA
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <h4 className="text-sm font-bold text-white group-hover:text-amber-300 transition-colors">
                            VIZ Admin
                          </h4>
                          <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/30">
                            Platform Super Admin
                          </span>
                        </div>
                        <p className="text-xs text-slate-400">
                          admin@vizexpo.in • KYC Queue & 3% Fee Reconciliation
                        </p>
                      </div>
                    </div>
                    <ArrowRight className="w-5 h-5 text-slate-500 group-hover:text-amber-400 group-hover:translate-x-1 transition-all" />
                  </div>
                </div>
              )}

              {/* Tab Content 2: Mobile OTP Sign-In */}
              {activeTab === 'otp' && (
                <div className="mt-6 space-y-4">
                  {!otpStep ? (
                    <form onSubmit={handleRequestOtp} className="space-y-4">
                      <div>
                        <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                          Mobile Number (India)
                        </label>
                        <div className="relative">
                          <Phone className="absolute left-3.5 top-3.5 w-4 h-4 text-slate-500" />
                          <input
                            type="tel"
                            value={phone}
                            onChange={(e) => setPhone(e.target.value)}
                            placeholder="+91 98888 12345"
                            className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-white placeholder:text-slate-600 text-sm focus:outline-none focus:border-blue-500"
                            required
                          />
                        </div>
                      </div>

                      <div>
                        <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                          Access Role
                        </label>
                        <div className="grid grid-cols-2 gap-2">
                          <button
                            type="button"
                            onClick={() => setOtpRole('INVESTOR')}
                            className={`py-2 px-3 rounded-xl text-xs font-semibold border flex items-center justify-center gap-1.5 ${
                              otpRole === 'INVESTOR'
                                ? 'bg-blue-600/20 text-blue-300 border-blue-500'
                                : 'bg-slate-950 border-slate-800 text-slate-400'
                            }`}
                          >
                            <UserCircle className="w-3.5 h-3.5" />
                            <span>Investor</span>
                          </button>
                          <button
                            type="button"
                            onClick={() => setOtpRole('BRAND')}
                            className={`py-2 px-3 rounded-xl text-xs font-semibold border flex items-center justify-center gap-1.5 ${
                              otpRole === 'BRAND'
                                ? 'bg-purple-600/20 text-purple-300 border-purple-500'
                                : 'bg-slate-950 border-slate-800 text-slate-400'
                            }`}
                          >
                            <Building2 className="w-3.5 h-3.5" />
                            <span>Brand Partner</span>
                          </button>
                        </div>
                      </div>

                      <button
                        type="submit"
                        disabled={loading}
                        className="w-full py-3 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white font-bold text-sm shadow-lg shadow-blue-500/25 transition-all flex items-center justify-center gap-2"
                      >
                        {loading ? 'Sending OTP...' : 'Send Secure OTP'}
                        <ArrowRight className="w-4 h-4" />
                      </button>
                    </form>
                  ) : (
                    <form onSubmit={handleVerifyOtp} className="space-y-4">
                      {devOtpHint && (
                        <div className="p-3 rounded-xl bg-amber-500/10 border border-amber-500/30 text-amber-300 text-xs flex items-center justify-between">
                          <span>Demo Code: <strong>{devOtpHint}</strong></span>
                          <button
                            type="button"
                            onClick={() => setOtpCode(devOtpHint)}
                            className="px-2 py-0.5 rounded bg-amber-500/20 text-amber-200 text-[10px] font-bold border border-amber-500/40"
                          >
                            Auto Fill
                          </button>
                        </div>
                      )}

                      <div>
                        <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                          Enter 6-Digit Verification Code
                        </label>
                        <input
                          type="text"
                          value={otpCode}
                          onChange={(e) => setOtpCode(e.target.value)}
                          placeholder="123456"
                          maxLength={6}
                          className="w-full text-center tracking-widest text-lg font-mono py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-white placeholder:text-slate-600 focus:outline-none focus:border-blue-500"
                          required
                        />
                      </div>

                      <div className="flex gap-2">
                        <button
                          type="button"
                          onClick={() => setOtpStep(false)}
                          className="w-1/3 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold"
                        >
                          Back
                        </button>
                        <button
                          type="submit"
                          disabled={loading}
                          className="w-2/3 py-2.5 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white font-bold text-xs shadow-lg shadow-blue-500/25"
                        >
                          {loading ? 'Verifying...' : 'Verify & Launch App'}
                        </button>
                      </div>

                      {/* Resend Cooldown Counter */}
                      <div className="pt-1 flex items-center justify-between text-xs text-slate-400">
                        <span>Didn't receive verification code?</span>
                        {resendCooldown > 0 ? (
                          <span className="text-slate-500 font-medium">Resend in {resendCooldown}s</span>
                        ) : (
                          <button
                            type="button"
                            onClick={() => handleRequestOtp()}
                            className="text-cyan-400 hover:text-cyan-300 font-semibold cursor-pointer"
                          >
                            Resend Code
                          </button>
                        )}
                      </div>
                    </form>
                  )}
                </div>
              )}

              {/* Tab Content 3: Email & Password */}
              {activeTab === 'email' && (
                <form onSubmit={handleEmailLogin} className="mt-6 space-y-4">
                  <div>
                    <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                      Business Email
                    </label>
                    <div className="relative">
                      <Mail className="absolute left-3.5 top-3.5 w-4 h-4 text-slate-500" />
                      <input
                        type="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        placeholder="rohit.sharma@gmail.com"
                        className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-white placeholder:text-slate-600 text-sm focus:outline-none focus:border-blue-500"
                        required
                      />
                    </div>
                  </div>

                  <div>
                    <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-1 mb-1.5">
                      <label className="text-xs font-semibold text-slate-300">Password</label>
                      <div className="flex flex-wrap gap-1 items-center">
                        <span className="text-[10px] text-slate-500">Fill demo:</span>
                        <button
                          type="button"
                          onClick={() => {
                            setEmail('rohit.sharma@gmail.com');
                            setPassword('Demo@1234');
                          }}
                          className="px-1.5 py-0.5 rounded bg-blue-500/20 text-blue-300 border border-blue-500/30 text-[10px] hover:bg-blue-500/30 font-medium"
                        >
                          Rohit
                        </button>
                        <button
                          type="button"
                          onClick={() => {
                            setEmail('franchise@burgerblast.in');
                            setPassword('Demo@1234');
                          }}
                          className="px-1.5 py-0.5 rounded bg-purple-500/20 text-purple-300 border border-purple-500/30 text-[10px] hover:bg-purple-500/30 font-medium"
                        >
                          Vikram
                        </button>
                        <button
                          type="button"
                          onClick={() => {
                            setEmail('admin@vizexpo.in');
                            setPassword('Demo@1234');
                          }}
                          className="px-1.5 py-0.5 rounded bg-amber-500/20 text-amber-300 border border-amber-500/30 text-[10px] hover:bg-amber-500/30 font-medium"
                        >
                          Admin
                        </button>
                      </div>
                    </div>
                    <div className="relative">
                      <Lock className="absolute left-3.5 top-3.5 w-4 h-4 text-slate-500" />
                      <input
                        type={showPassword ? 'text' : 'password'}
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        placeholder="••••••••"
                        className="w-full pl-10 pr-10 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-white placeholder:text-slate-600 text-sm focus:outline-none focus:border-blue-500"
                        required
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-3.5 top-3.5 text-slate-500 hover:text-slate-300"
                      >
                        {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      </button>
                    </div>
                  </div>

                  <button
                    type="submit"
                    disabled={loading}
                    className="w-full py-3 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white font-bold text-sm shadow-lg shadow-blue-500/25 transition-all flex items-center justify-center gap-2"
                  >
                    {loading ? 'Authenticating...' : 'Sign In with Email'}
                    <ArrowRight className="w-4 h-4" />
                  </button>
                </form>
              )}

              {/* Tab Content 4: Registration */}
              {activeTab === 'register' && (
                <form onSubmit={handleRegister} className="mt-6 space-y-3.5">
                  <div>
                    <label className="block text-xs font-semibold text-slate-300 mb-1">
                      Account Type
                    </label>
                    <div className="grid grid-cols-2 gap-2">
                      <button
                        type="button"
                        onClick={() => setRegRole('INVESTOR')}
                        className={`py-1.5 px-3 rounded-xl text-xs font-semibold border ${
                          regRole === 'INVESTOR'
                            ? 'bg-blue-600/20 text-blue-300 border-blue-500'
                            : 'bg-slate-950 border-slate-800 text-slate-400'
                        }`}
                      >
                        Investor
                      </button>
                      <button
                        type="button"
                        onClick={() => setRegRole('BRAND')}
                        className={`py-1.5 px-3 rounded-xl text-xs font-semibold border ${
                          regRole === 'BRAND'
                            ? 'bg-purple-600/20 text-purple-300 border-purple-500'
                            : 'bg-slate-950 border-slate-800 text-slate-400'
                        }`}
                      >
                        Franchisor
                      </button>
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-300 mb-1">
                      Full Name
                    </label>
                    <input
                      type="text"
                      value={regName}
                      onChange={(e) => setRegName(e.target.value)}
                      placeholder="e.g. Ananya Sharma"
                      className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-white text-xs focus:outline-none focus:border-blue-500"
                      required
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <label className="block text-xs font-semibold text-slate-300 mb-1">Email</label>
                      <input
                        type="email"
                        value={regEmail}
                        onChange={(e) => setRegEmail(e.target.value)}
                        placeholder="name@email.com"
                        className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-white text-xs focus:outline-none focus:border-blue-500"
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-slate-300 mb-1">Phone</label>
                      <input
                        type="tel"
                        value={regPhone}
                        onChange={(e) => setRegPhone(e.target.value)}
                        placeholder="+91 99999..."
                        className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-white text-xs focus:outline-none focus:border-blue-500"
                        required
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <label className="block text-xs font-semibold text-slate-300 mb-1">Password</label>
                      <input
                        type="password"
                        value={regPassword}
                        onChange={(e) => setRegPassword(e.target.value)}
                        placeholder="••••••••"
                        className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-white text-xs focus:outline-none focus:border-blue-500"
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-slate-300 mb-1">Confirm</label>
                      <input
                        type="password"
                        value={regConfirmPassword}
                        onChange={(e) => setRegConfirmPassword(e.target.value)}
                        placeholder="••••••••"
                        className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-white text-xs focus:outline-none focus:border-blue-500"
                        required
                      />
                    </div>
                  </div>

                  <button
                    type="submit"
                    disabled={loading}
                    className="w-full mt-2 py-2.5 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white font-bold text-xs shadow-lg shadow-blue-500/25"
                  >
                    {loading ? 'Creating Account...' : 'Complete Registration'}
                  </button>
                </form>
              )}
            </div>
          </div>
        </div>

        {/* Bottom Platform Guarantee Footer */}
        <div className="pt-6 border-t border-slate-800/80 text-center space-y-2">
          <div className="flex flex-wrap items-center justify-center gap-6 text-xs text-slate-500">
            <span className="flex items-center gap-1.5">
              <ShieldCheck className="w-4 h-4 text-cyan-400" />
              <span>Bank Escrow Secured</span>
            </span>
            <span className="flex items-center gap-1.5">
              <Award className="w-4 h-4 text-amber-400" />
              <span>Vetted Legal Franchise Term Sheets</span>
            </span>
            <span className="flex items-center gap-1.5">
              <Globe className="w-4 h-4 text-emerald-400" />
              <span>Pan-India Expansion Coverage</span>
            </span>
          </div>
          <p className="text-[11px] text-slate-600">
            © 2026 VIZ INDIA DIGITAL EXPO. All rights reserved. Built for high-velocity B2B franchise transactions.
          </p>
        </div>
      </div>
    </div>
  );
};

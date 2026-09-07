import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { authApi } from '../services/api';
import {
  X,
  UserCircle,
  Building2,
  ShieldCheck,
  Phone,
  Mail,
  Lock,
  Eye,
  EyeOff,
  KeyRound,
  ArrowRight,
  CheckCircle2,
  AlertCircle,
  Sparkles,
  Zap,
} from 'lucide-react';

interface LoginModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: (role: string) => void;
  initialMode?: 'login' | 'register' | 'otp' | 'demo';
}

export const LoginModal: React.FC<LoginModalProps> = ({
  isOpen,
  onClose,
  onSuccess,
  initialMode = 'login',
}) => {
  const { loginWithPassword, registerUser, verifyOTPCode, loginWithRole } = useAuth();

  // Active Tab: 'login' | 'register' | 'otp' | 'demo'
  const [activeTab, setActiveTab] = useState<'login' | 'register' | 'otp' | 'demo'>(initialMode);

  // Form Fields: Login
  const [loginEmail, setLoginEmail] = useState('');
  const [loginPassword, setLoginPassword] = useState('');
  const [showLoginPassword, setShowLoginPassword] = useState(false);

  // Form Fields: Registration
  const [regName, setRegName] = useState('');
  const [regEmail, setRegEmail] = useState('');
  const [regPhone, setRegPhone] = useState('+91 ');
  const [regRole, setRegRole] = useState<'INVESTOR' | 'BRAND'>('INVESTOR');
  const [regPassword, setRegPassword] = useState('');
  const [regConfirmPassword, setRegConfirmPassword] = useState('');
  const [showRegPassword, setShowRegPassword] = useState(false);
  const [showRegConfirmPassword, setShowRegConfirmPassword] = useState(false);

  // OTP Verification Step
  const [isOtpStep, setIsOtpStep] = useState(false);
  const [otpTargetIdentifier, setOtpTargetIdentifier] = useState('');
  const [otpUserId, setOtpUserId] = useState<string | undefined>(undefined);
  const [otpCode, setOtpCode] = useState('');
  const [devOtpBadge, setDevOtpBadge] = useState<string | null>(null);

  // Standalone Mobile OTP
  const [otpPhone, setOtpPhone] = useState('+91 98888 12345');
  const [otpRoleChoice, setOtpRoleChoice] = useState<'INVESTOR' | 'BRAND'>('INVESTOR');

  // Status & Feedback
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [successToast, setSuccessToast] = useState('');

  // Reset states when opened
  useEffect(() => {
    if (isOpen) {
      setErrorMsg('');
      setSuccessToast('');
      setIsOtpStep(false);
      setDevOtpBadge(null);
    }
  }, [isOpen, activeTab]);

  if (!isOpen) return null;

  // Real-time password validations
  const isPasswordLongEnough = regPassword.length >= 8;
  const hasUppercase = /[A-Z]/.test(regPassword);
  const hasNumber = /[0-9]/.test(regPassword);
  const passwordsMatch = regPassword.length > 0 && regPassword === regConfirmPassword;
  const isRegFormValid =
    regName.trim().length >= 2 &&
    /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(regEmail.trim()) &&
    regPhone.trim().length >= 10 &&
    isPasswordLongEnough &&
    hasUppercase &&
    hasNumber &&
    passwordsMatch;

  // 1. Handle Email + Password Sign In
  const handleEmailLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!loginEmail || !loginPassword) {
      setErrorMsg('Please enter both email and password.');
      return;
    }

    setLoading(true);
    setErrorMsg('');
    const result = await loginWithPassword(loginEmail, loginPassword);
    setLoading(false);

    if (result.success) {
      setSuccessToast(result.message || 'Login successful! Redirecting...');
      setTimeout(() => {
        onSuccess(result.role || 'INVESTOR');
        onClose();
      }, 700);
    } else {
      setErrorMsg(result.message || 'Invalid email or password.');
    }
  };

  // 2. Handle Registration
  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isRegFormValid) {
      setErrorMsg('Please satisfy all password complexity and matching requirements.');
      return;
    }

    setLoading(true);
    setErrorMsg('');
    const result = await registerUser({
      name: regName,
      email: regEmail,
      phone: regPhone,
      role: regRole,
      password: regPassword,
      confirmPassword: regConfirmPassword,
    });
    setLoading(false);

    if (result.success) {
      setOtpTargetIdentifier(regEmail);
      setOtpUserId(result.userId);
      setIsOtpStep(true);

      if (result.devOtp) {
        setDevOtpBadge(result.devOtp);
        setOtpCode(result.devOtp); // Auto-fill dev OTP for frictionless testing
      }
    } else {
      setErrorMsg(result.message || 'Registration failed.');
    }
  };

  // 3. Handle Standalone Mobile OTP Request
  const handleRequestOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!otpPhone || otpPhone.length < 10) {
      setErrorMsg('Please enter a valid mobile number.');
      return;
    }
    setLoading(true);
    setErrorMsg('');
    try {
      const res = await authApi.requestOtp(otpPhone);
      setLoading(false);
      if (res.data.success) {
        setOtpTargetIdentifier(otpPhone);
        setIsOtpStep(true);
        if (res.data.devOtp || res.data.otpDemo) {
          const code = res.data.devOtp || res.data.otpDemo;
          setDevOtpBadge(code);
          setOtpCode(code);
        }
      } else {
        setErrorMsg('Failed to send OTP.');
      }
    } catch (err: any) {
      setLoading(false);
      setErrorMsg(err.message || 'Could not send OTP');
    }
  };

  // 4. Handle OTP Verification
  const handleVerifyOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!otpCode || otpCode.length < 6) {
      setErrorMsg('Please enter the 6-digit OTP code.');
      return;
    }

    setLoading(true);
    setErrorMsg('');
    const result = await verifyOTPCode({
      email: otpTargetIdentifier.includes('@') ? otpTargetIdentifier : undefined,
      phone: !otpTargetIdentifier.includes('@') ? otpTargetIdentifier : undefined,
      otp: otpCode,
      userId: otpUserId,
      role: activeTab === 'register' ? regRole : otpRoleChoice,
      name: regName || undefined,
    });
    setLoading(false);

    if (result.success) {
      setSuccessToast('Account verified! Welcome to VIZ India Expo.');
      setTimeout(() => {
        onSuccess(result.role || 'INVESTOR');
        onClose();
      }, 700);
    } else {
      setErrorMsg(result.message || 'Invalid or expired OTP code.');
    }
  };

  // 5. 1-Click Demo Login
  const handleDemoLogin = async (role: 'INVESTOR' | 'BRAND' | 'ADMIN') => {
    setLoading(true);
    setErrorMsg('');
    try {
      await loginWithRole(role);
      setSuccessToast(`Welcome! Logged in as ${role}`);
      setTimeout(() => {
        onSuccess(role);
        onClose();
      }, 600);
    } catch (err: any) {
      setErrorMsg(err.message || 'Demo login failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/85 backdrop-blur-md animate-in fade-in duration-200 overflow-y-auto">
      <div className="relative w-full max-w-lg my-8 rounded-3xl bg-slate-900 border border-slate-800 shadow-2xl p-6 sm:p-8 space-y-5 text-white">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-5 right-5 p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition-all"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Modal Header */}
        <div className="text-center space-y-1.5">
          <div className="w-12 h-12 mx-auto rounded-2xl bg-gradient-to-tr from-blue-600 via-indigo-600 to-amber-500 flex items-center justify-center font-black text-xl text-white shadow-lg shadow-blue-500/25">
            V
          </div>
          <h2 className="text-xl font-black tracking-tight font-['Outfit']">
            VIZ India Digital Expo
          </h2>
          <p className="text-xs text-slate-400">
            India's 24/7 Verified B2B Franchise Marketplace & Deal Room
          </p>
        </div>

        {/* Success Toast */}
        {successToast && (
          <div className="p-3.5 rounded-2xl bg-emerald-500/15 border border-emerald-500/40 text-xs text-emerald-400 font-semibold flex items-center gap-2.5 animate-in slide-in-from-top-2">
            <CheckCircle2 className="w-4 h-4 flex-shrink-0 text-emerald-400" />
            <span>{successToast}</span>
          </div>
        )}

        {/* Error Alert */}
        {errorMsg && (
          <div className="p-3 rounded-xl bg-red-500/10 border border-red-500/30 text-xs text-red-400 font-medium flex items-center gap-2">
            <AlertCircle className="w-4 h-4 flex-shrink-0" />
            <span>{errorMsg}</span>
          </div>
        )}

        {/* Main Navigation Tabs (hidden during active OTP step) */}
        {!isOtpStep && (
          <div className="grid grid-cols-4 p-1 rounded-2xl bg-slate-950 border border-slate-800 text-[11px] font-bold text-center">
            <button
              onClick={() => {
                setActiveTab('login');
                setErrorMsg('');
              }}
              className={`py-2 px-1 rounded-xl transition-all ${
                activeTab === 'login'
                  ? 'bg-blue-600 text-white shadow'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              Sign In
            </button>
            <button
              onClick={() => {
                setActiveTab('register');
                setErrorMsg('');
              }}
              className={`py-2 px-1 rounded-xl transition-all ${
                activeTab === 'register'
                  ? 'bg-blue-600 text-white shadow'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              Register
            </button>
            <button
              onClick={() => {
                setActiveTab('otp');
                setErrorMsg('');
              }}
              className={`py-2 px-1 rounded-xl transition-all ${
                activeTab === 'otp'
                  ? 'bg-blue-600 text-white shadow'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              Phone OTP
            </button>
            <button
              onClick={() => {
                setActiveTab('demo');
                setErrorMsg('');
              }}
              className={`py-2 px-1 rounded-xl transition-all flex items-center justify-center gap-1 ${
                activeTab === 'demo'
                  ? 'bg-amber-600 text-white shadow'
                  : 'text-amber-400 hover:text-amber-300'
              }`}
            >
              <Zap className="w-3 h-3" />
              <span>1-Click</span>
            </button>
          </div>
        )}

        {/* ------------------------------------------------------------- */}
        {/* OTP VERIFICATION VIEW (Common for Registration & Phone Login)  */}
        {/* ------------------------------------------------------------- */}
        {isOtpStep ? (
          <form onSubmit={handleVerifyOtp} className="space-y-4">
            <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 text-center space-y-2">
              <div className="w-10 h-10 mx-auto rounded-full bg-blue-500/20 text-blue-400 flex items-center justify-center">
                <KeyRound className="w-5 h-5" />
              </div>
              <h3 className="text-sm font-bold text-white">Enter 6-Digit Verification Code</h3>
              <p className="text-xs text-slate-400">
                Verification code dispatched for <span className="text-blue-400 font-semibold">{otpTargetIdentifier}</span>
              </p>

              {/* Dev Mode OTP Display Badge */}
              {devOtpBadge && (
                <div className="mt-2 inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-500/15 border border-amber-500/30 text-amber-300 text-xs font-mono font-bold">
                  <Sparkles className="w-3.5 h-3.5 text-amber-400 animate-pulse" />
                  <span>Dev Mode OTP: {devOtpBadge}</span>
                </div>
              )}
            </div>

            <div className="space-y-1.5">
              <label className="text-[11px] font-bold text-slate-300 uppercase tracking-wider">
                6-Digit OTP Code
              </label>
              <input
                type="text"
                maxLength={6}
                autoComplete="one-time-code"
                placeholder="123456"
                value={otpCode}
                onChange={(e) => setOtpCode(e.target.value.replace(/\D/g, ''))}
                className="w-full px-4 py-3 rounded-xl bg-slate-950 border border-blue-500/50 text-white text-center text-lg tracking-[0.5em] font-mono placeholder:text-slate-600 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              <p className="text-[10px] text-slate-500 text-center">
                Pre-filled automatically in testing mode. You can edit manually if desired.
              </p>
            </div>

            <div className="flex gap-2 pt-2">
              <button
                type="button"
                onClick={() => setIsOtpStep(false)}
                className="w-1/3 py-3 rounded-xl bg-slate-800 hover:bg-slate-700 text-xs font-bold text-slate-300 transition-all"
              >
                Back
              </button>
              <button
                type="submit"
                disabled={loading || otpCode.length < 6}
                className="w-2/3 py-3 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white text-xs font-bold flex items-center justify-center gap-2 shadow-lg shadow-blue-600/30 transition-all disabled:opacity-50"
              >
                {loading ? (
                  <span>Verifying...</span>
                ) : (
                  <>
                    <CheckCircle2 className="w-4 h-4" />
                    <span>Verify & Enter Dashboard</span>
                  </>
                )}
              </button>
            </div>
          </form>
        ) : (
          <>
            {/* ------------------------------------------------------------- */}
            {/* TAB 1: EMAIL & PASSWORD LOGIN                                  */}
            {/* ------------------------------------------------------------- */}
            {activeTab === 'login' && (
              <form onSubmit={handleEmailLogin} className="space-y-4">
                <div className="space-y-1.5">
                  <label className="text-[11px] font-bold text-slate-300 uppercase tracking-wider">
                    Work / Personal Email
                  </label>
                  <div className="relative">
                    <Mail className="w-4 h-4 absolute left-3.5 top-3.5 text-slate-500" />
                    <input
                      type="email"
                      required
                      placeholder="e.g. rohit.sharma@gmail.com"
                      value={loginEmail}
                      onChange={(e) => setLoginEmail(e.target.value)}
                      className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-white text-xs placeholder:text-slate-600 focus:outline-none focus:border-blue-500"
                    />
                  </div>
                </div>

                <div className="space-y-1.5">
                  <div className="flex items-center justify-between">
                    <label className="text-[11px] font-bold text-slate-300 uppercase tracking-wider">
                      Password
                    </label>
                    <span className="text-[10px] text-slate-500">
                      Default test pass: <span className="font-mono text-slate-400">Password123</span>
                    </span>
                  </div>
                  <div className="relative">
                    <Lock className="w-4 h-4 absolute left-3.5 top-3.5 text-slate-500" />
                    <input
                      type={showLoginPassword ? 'text' : 'password'}
                      required
                      placeholder="••••••••"
                      value={loginPassword}
                      onChange={(e) => setLoginPassword(e.target.value)}
                      className="w-full pl-10 pr-10 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-white text-xs placeholder:text-slate-600 focus:outline-none focus:border-blue-500"
                    />
                    <button
                      type="button"
                      onClick={() => setShowLoginPassword(!showLoginPassword)}
                      className="absolute right-3.5 top-3 text-slate-500 hover:text-slate-300"
                    >
                      {showLoginPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full py-3 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white text-xs font-bold flex items-center justify-center gap-2 shadow-lg shadow-blue-600/30 transition-all disabled:opacity-50"
                >
                  {loading ? (
                    <span>Authenticating...</span>
                  ) : (
                    <>
                      <span>Sign In to Dashboard</span>
                      <ArrowRight className="w-4 h-4" />
                    </>
                  )}
                </button>

                <div className="text-center pt-1">
                  <p className="text-[11px] text-slate-400">
                    Don't have an account?{' '}
                    <button
                      type="button"
                      onClick={() => setActiveTab('register')}
                      className="text-blue-400 font-bold hover:underline"
                    >
                      Create one here
                    </button>
                  </p>
                </div>
              </form>
            )}

            {/* ------------------------------------------------------------- */}
            {/* TAB 2: REGISTRATION (Email, Confirm Password & Role)           */}
            {/* ------------------------------------------------------------- */}
            {activeTab === 'register' && (
              <form onSubmit={handleRegister} className="space-y-3.5">
                {/* Account Type Selection (Strictly Investor or Brand - Admin disabled) */}
                <div className="space-y-1.5">
                  <label className="text-[11px] font-bold text-slate-300 uppercase tracking-wider">
                    Select Account Role:
                  </label>
                  <div className="grid grid-cols-2 gap-2">
                    <button
                      type="button"
                      onClick={() => setRegRole('INVESTOR')}
                      className={`p-2.5 rounded-xl border text-xs font-bold flex items-center justify-center gap-2 transition-all ${
                        regRole === 'INVESTOR'
                          ? 'bg-blue-600/20 border-blue-500 text-blue-300 shadow'
                          : 'bg-slate-950 border-slate-800 text-slate-400 hover:text-slate-200'
                      }`}
                    >
                      <UserCircle className="w-4 h-4" />
                      <span>Investor</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => setRegRole('BRAND')}
                      className={`p-2.5 rounded-xl border text-xs font-bold flex items-center justify-center gap-2 transition-all ${
                        regRole === 'BRAND'
                          ? 'bg-purple-600/20 border-purple-500 text-purple-300 shadow'
                          : 'bg-slate-950 border-slate-800 text-slate-400 hover:text-slate-200'
                      }`}
                    >
                      <Building2 className="w-4 h-4" />
                      <span>Brand Partner</span>
                    </button>
                  </div>
                </div>

                {/* Full Name */}
                <div className="space-y-1">
                  <label className="text-[11px] font-bold text-slate-300 uppercase tracking-wider">
                    Full Name
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Vikram Malhotra"
                    value={regName}
                    onChange={(e) => setRegName(e.target.value)}
                    className="w-full px-3.5 py-2 rounded-xl bg-slate-950 border border-slate-800 text-white text-xs placeholder:text-slate-600 focus:outline-none focus:border-blue-500"
                  />
                </div>

                {/* Email and Phone 2-Col Grid */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  <div className="space-y-1">
                    <label className="text-[11px] font-bold text-slate-300 uppercase tracking-wider">
                      Email Address
                    </label>
                    <input
                      type="email"
                      required
                      placeholder="vikram@example.com"
                      value={regEmail}
                      onChange={(e) => setRegEmail(e.target.value)}
                      className="w-full px-3.5 py-2 rounded-xl bg-slate-950 border border-slate-800 text-white text-xs placeholder:text-slate-600 focus:outline-none focus:border-blue-500"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-[11px] font-bold text-slate-300 uppercase tracking-wider">
                      Mobile Number
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="+91 98888 12345"
                      value={regPhone}
                      onChange={(e) => setRegPhone(e.target.value)}
                      className="w-full px-3.5 py-2 rounded-xl bg-slate-950 border border-slate-800 text-white text-xs placeholder:text-slate-600 focus:outline-none focus:border-blue-500"
                    />
                  </div>
                </div>

                {/* Password & Confirm Password */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  <div className="space-y-1">
                    <label className="text-[11px] font-bold text-slate-300 uppercase tracking-wider">
                      Password
                    </label>
                    <div className="relative">
                      <input
                        type={showRegPassword ? 'text' : 'password'}
                        required
                        placeholder="Min. 8 chars"
                        value={regPassword}
                        onChange={(e) => setRegPassword(e.target.value)}
                        className="w-full pl-3.5 pr-8 py-2 rounded-xl bg-slate-950 border border-slate-800 text-white text-xs placeholder:text-slate-600 focus:outline-none focus:border-blue-500"
                      />
                      <button
                        type="button"
                        onClick={() => setShowRegPassword(!showRegPassword)}
                        className="absolute right-2.5 top-2.5 text-slate-500 hover:text-slate-300"
                      >
                        {showRegPassword ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                      </button>
                    </div>
                  </div>

                  <div className="space-y-1">
                    <label className="text-[11px] font-bold text-slate-300 uppercase tracking-wider">
                      Confirm Password
                    </label>
                    <div className="relative">
                      <input
                        type={showRegConfirmPassword ? 'text' : 'password'}
                        required
                        placeholder="Re-type password"
                        value={regConfirmPassword}
                        onChange={(e) => setRegConfirmPassword(e.target.value)}
                        className={`w-full pl-3.5 pr-8 py-2 rounded-xl bg-slate-950 border text-white text-xs placeholder:text-slate-600 focus:outline-none ${
                          regConfirmPassword.length > 0
                            ? passwordsMatch
                              ? 'border-emerald-500/80 focus:border-emerald-500'
                              : 'border-red-500/80 focus:border-red-500'
                            : 'border-slate-800 focus:border-blue-500'
                        }`}
                      />
                      <button
                        type="button"
                        onClick={() => setShowRegConfirmPassword(!showRegConfirmPassword)}
                        className="absolute right-2.5 top-2.5 text-slate-500 hover:text-slate-300"
                      >
                        {showRegConfirmPassword ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                      </button>
                    </div>
                  </div>
                </div>

                {/* Live Password Rules Feedback */}
                <div className="p-2.5 rounded-xl bg-slate-950 border border-slate-800/80 space-y-1 text-[10px]">
                  <div className="flex items-center gap-1.5">
                    <span className={isPasswordLongEnough ? 'text-emerald-400 font-bold' : 'text-slate-500'}>
                      {isPasswordLongEnough ? '✓' : '•'} Minimum 8 characters
                    </span>
                    <span className="text-slate-600">|</span>
                    <span className={hasUppercase ? 'text-emerald-400 font-bold' : 'text-slate-500'}>
                      {hasUppercase ? '✓' : '•'} 1 Uppercase
                    </span>
                    <span className="text-slate-600">|</span>
                    <span className={hasNumber ? 'text-emerald-400 font-bold' : 'text-slate-500'}>
                      {hasNumber ? '✓' : '•'} 1 Number
                    </span>
                  </div>
                  {regConfirmPassword.length > 0 && (
                    <div className={passwordsMatch ? 'text-emerald-400 font-bold' : 'text-red-400 font-medium'}>
                      {passwordsMatch ? '✓ Passwords match' : '✕ Passwords do not match'}
                    </div>
                  )}
                </div>

                <button
                  type="submit"
                  disabled={loading || !isRegFormValid}
                  className="w-full py-3 rounded-xl bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 hover:from-blue-500 hover:to-purple-500 text-white text-xs font-bold flex items-center justify-center gap-2 shadow-lg shadow-blue-600/30 transition-all disabled:opacity-40"
                >
                  {loading ? (
                    <span>Creating Account...</span>
                  ) : (
                    <>
                      <span>Create Account & Verify OTP</span>
                      <ArrowRight className="w-4 h-4" />
                    </>
                  )}
                </button>
              </form>
            )}

            {/* ------------------------------------------------------------- */}
            {/* TAB 3: PHONE OTP LOGIN                                         */}
            {/* ------------------------------------------------------------- */}
            {activeTab === 'otp' && (
              <form onSubmit={handleRequestOtp} className="space-y-4">
                <div className="space-y-1.5">
                  <label className="text-[11px] font-bold text-slate-300 uppercase tracking-wider">
                    Sign In Role
                  </label>
                  <div className="grid grid-cols-2 gap-2">
                    <button
                      type="button"
                      onClick={() => setOtpRoleChoice('INVESTOR')}
                      className={`p-2.5 rounded-xl border text-xs font-bold flex items-center justify-center gap-2 transition-all ${
                        otpRoleChoice === 'INVESTOR'
                          ? 'bg-blue-600/20 border-blue-500 text-blue-300'
                          : 'bg-slate-950 border-slate-800 text-slate-400'
                      }`}
                    >
                      <UserCircle className="w-4 h-4" />
                      <span>Investor</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => setOtpRoleChoice('BRAND')}
                      className={`p-2.5 rounded-xl border text-xs font-bold flex items-center justify-center gap-2 transition-all ${
                        otpRoleChoice === 'BRAND'
                          ? 'bg-purple-600/20 border-purple-500 text-purple-300'
                          : 'bg-slate-950 border-slate-800 text-slate-400'
                      }`}
                    >
                      <Building2 className="w-4 h-4" />
                      <span>Brand Partner</span>
                    </button>
                  </div>
                </div>

                <div className="space-y-1.5">
                  <label className="text-[11px] font-bold text-slate-300 uppercase tracking-wider">
                    Registered Mobile Number
                  </label>
                  <div className="relative">
                    <Phone className="w-4 h-4 absolute left-3.5 top-3.5 text-slate-500" />
                    <input
                      type="text"
                      required
                      placeholder="+91 98888 12345"
                      value={otpPhone}
                      onChange={(e) => setOtpPhone(e.target.value)}
                      className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-white text-xs placeholder:text-slate-600 focus:outline-none focus:border-blue-500"
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full py-3 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white text-xs font-bold flex items-center justify-center gap-2 shadow-lg shadow-blue-600/30 transition-all"
                >
                  {loading ? (
                    <span>Sending Code...</span>
                  ) : (
                    <>
                      <span>Send 6-Digit OTP</span>
                      <ArrowRight className="w-4 h-4" />
                    </>
                  )}
                </button>
              </form>
            )}

            {/* ------------------------------------------------------------- */}
            {/* TAB 4: 1-CLICK DEMO LOGIN (Rapid persona testing)              */}
            {/* ------------------------------------------------------------- */}
            {activeTab === 'demo' && (
              <div className="space-y-3">
                <p className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider text-center">
                  Instant Test Sign In:
                </p>

                {/* Investor */}
                <button
                  onClick={() => handleDemoLogin('INVESTOR')}
                  disabled={loading}
                  className="w-full p-3.5 rounded-2xl bg-slate-950 hover:bg-slate-800 border border-slate-800 hover:border-blue-500/50 flex items-center justify-between group transition-all text-left"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-xl bg-blue-500/20 border border-blue-500/30 flex items-center justify-center text-blue-400 group-hover:scale-105 transition-transform">
                      <UserCircle className="w-4 h-4" />
                    </div>
                    <div>
                      <h4 className="text-xs font-bold text-white">Investor (Rohit Sharma)</h4>
                      <p className="text-[10px] text-slate-400">Expo Floor, Matchmaking & Direct Deal Room</p>
                    </div>
                  </div>
                  <ArrowRight className="w-4 h-4 text-slate-500 group-hover:text-blue-400 transition-all" />
                </button>

                {/* Brand Admin */}
                <button
                  onClick={() => handleDemoLogin('BRAND')}
                  disabled={loading}
                  className="w-full p-3.5 rounded-2xl bg-slate-950 hover:bg-slate-800 border border-slate-800 hover:border-purple-500/50 flex items-center justify-between group transition-all text-left"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-xl bg-purple-500/20 border border-purple-500/30 flex items-center justify-center text-purple-400 group-hover:scale-105 transition-transform">
                      <Building2 className="w-4 h-4" />
                    </div>
                    <div>
                      <h4 className="text-xs font-bold text-white">Brand Partner (Chai Shai Express)</h4>
                      <p className="text-[10px] text-slate-400">Leads CRM Kanban, Grounded KB & Deals</p>
                    </div>
                  </div>
                  <ArrowRight className="w-4 h-4 text-slate-500 group-hover:text-purple-400 transition-all" />
                </button>

                {/* Admin */}
                <button
                  onClick={() => handleDemoLogin('ADMIN')}
                  disabled={loading}
                  className="w-full p-3.5 rounded-2xl bg-slate-950 hover:bg-slate-800 border border-slate-800 hover:border-amber-500/50 flex items-center justify-between group transition-all text-left"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-xl bg-amber-500/20 border border-amber-500/30 flex items-center justify-center text-amber-400 group-hover:scale-105 transition-transform">
                      <ShieldCheck className="w-4 h-4" />
                    </div>
                    <div>
                      <h4 className="text-xs font-bold text-white">VIZ Platform Admin</h4>
                      <p className="text-[10px] text-slate-400">Brand Verification & 3% Commission Ledger</p>
                    </div>
                  </div>
                  <ArrowRight className="w-4 h-4 text-slate-500 group-hover:text-amber-400 transition-all" />
                </button>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
};

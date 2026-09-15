import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { authApi } from '../services/api';
import {
  X,
  ArrowLeft,
  ArrowRight,
  Lock,
  Eye,
  EyeOff,
  Sparkles,
  TrendingUp,
  Building2,
  Zap,
  ShieldCheck,
  ChevronDown,
  ChevronUp,
} from 'lucide-react';

interface LoginModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: (role: string) => void;
  initialMode?: 'login' | 'register' | 'otp' | 'demo';
  initialRole?: 'INVESTOR' | 'BRAND';
}

export const LoginModal: React.FC<LoginModalProps> = ({
  isOpen,
  onClose,
  onSuccess,
}) => {
  const { loginWithPassword, registerUser, verifyOTPCode, updateUserRole, loginWithRole } = useAuth();

  // Modal Flow Step: 'IDENTIFIER' (Screen 1) | 'CREDENTIAL' (Screen 2) | 'ROLE_SELECT' (Screen 3 for new accounts)
  const [step, setStep] = useState<'IDENTIFIER' | 'CREDENTIAL' | 'ROLE_SELECT'>('IDENTIFIER');

  // Screen 1: Identifier
  const [identifier, setIdentifier] = useState('');
  const [identifierType, setIdentifierType] = useState<'EMAIL' | 'PHONE'>('EMAIL');
  const [isExistingUser, setIsExistingUser] = useState(false);

  // Screen 2: Credential (Password or OTP)
  const [credentialMode, setCredentialMode] = useState<'PASSWORD' | 'OTP'>('PASSWORD');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [otpCode, setOtpCode] = useState('');
  const [devOtpHint, setDevOtpHint] = useState<string | null>(null);
  const [resendCooldown, setResendCooldown] = useState(0);

  // UI state
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [showDemoTuck, setShowDemoTuck] = useState(false);

  // Reset state when modal opens
  useEffect(() => {
    if (isOpen) {
      setStep('IDENTIFIER');
      setIdentifier('');
      setPassword('');
      setOtpCode('');
      setErrorMsg('');
      setShowDemoTuck(false);
      setDevOtpHint(null);
      setLoading(false);
    }
  }, [isOpen]);

  // Resend OTP countdown
  useEffect(() => {
    if (resendCooldown > 0) {
      const timer = setTimeout(() => setResendCooldown(resendCooldown - 1), 1000);
      return () => clearTimeout(timer);
    }
  }, [resendCooldown]);

  if (!isOpen) return null;

  // 1. Screen 1 Continue Click (Amazon Step 1)
  const handleContinueIdentifier = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');

    const clean = identifier.trim();
    if (!clean) {
      setErrorMsg('Please enter your mobile number or email.');
      return;
    }

    const isEmail = clean.includes('@');
    if (isEmail) {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(clean)) {
        setErrorMsg('Please enter a valid email address.');
        return;
      }
    } else {
      const digitsOnly = clean.replace(/\D/g, '');
      if (digitsOnly.length < 10) {
        setErrorMsg('Please enter a valid 10-digit mobile number.');
        return;
      }
    }

    setLoading(true);
    try {
      const res = await authApi.checkIdentifier(clean);
      const isPhone = res.data.type === 'PHONE';
      setIdentifierType(res.data.type);
      setIsExistingUser(res.data.exists);

      if (isPhone) {
        // If phone, automatically send OTP for seamless experience
        setCredentialMode('OTP');
        try {
          const otpRes = await authApi.requestOtp(clean);
          const devCode = otpRes.data.devOtp || otpRes.data.otpDemo || '123456';
          setDevOtpHint(devCode);
          setOtpCode(devCode);
          setResendCooldown(30);
        } catch {
          // fallback
          setDevOtpHint('123456');
          setOtpCode('123456');
        }
      } else {
        setCredentialMode('PASSWORD');
      }

      setStep('CREDENTIAL');
    } catch (err: any) {
      setErrorMsg(err.response?.data?.message || err.message || 'Unable to proceed. Please check connection.');
    } finally {
      setLoading(false);
    }
  };

  // 2. Screen 2 Credential Submit (Sign In or Register)
  const handleCredentialSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');

    if (credentialMode === 'PASSWORD') {
      if (!password || password.length < 6) {
        setErrorMsg('Password must be at least 6 characters.');
        return;
      }

      setLoading(true);
      try {
        if (isExistingUser) {
          // Existing user login
          const res = await loginWithPassword(identifier.trim(), password);
          if (res.success) {
            onSuccess(res.role || 'INVESTOR');
          } else {
            setErrorMsg(res.message || 'Incorrect password.');
          }
        } else {
          // New user registration with minimal information
          const regRes = await registerUser({
            identifier: identifier.trim(),
            password,
          });

          if (regRes.success) {
            // Transition immediately to Screen 3 (Role Choice)
            setStep('ROLE_SELECT');
          } else {
            setErrorMsg(regRes.message || 'Registration failed.');
          }
        }
      } catch (err: any) {
        setErrorMsg(err.message || 'Authentication failed.');
      } finally {
        setLoading(false);
      }
    } else {
      // Mobile OTP submission
      if (!otpCode || otpCode.trim().length < 4) {
        setErrorMsg('Please enter the verification code.');
        return;
      }

      setLoading(true);
      try {
        const res = await verifyOTPCode({
          phone: identifier.trim(),
          otp: otpCode.trim(),
          role: 'INVESTOR',
        });

        if (res.success) {
          if (!isExistingUser) {
            setStep('ROLE_SELECT');
          } else {
            onSuccess(res.role || 'INVESTOR');
          }
        } else {
          setErrorMsg(res.message || 'Invalid or expired code.');
        }
      } catch (err: any) {
        setErrorMsg(err.message || 'Verification failed.');
      } finally {
        setLoading(false);
      }
    }
  };

  // Resend OTP for Phone
  const handleResendOtp = async () => {
    if (resendCooldown > 0) return;
    setLoading(true);
    setErrorMsg('');
    try {
      const res = await authApi.requestOtp(identifier.trim());
      const devCode = res.data.devOtp || res.data.otpDemo || '123456';
      setDevOtpHint(devCode);
      setOtpCode(devCode);
      setResendCooldown(30);
    } catch (err: any) {
      setErrorMsg('Failed to resend OTP.');
    } finally {
      setLoading(false);
    }
  };

  // 3. Screen 3: 1-Click Role Selection for new accounts
  const handlePickRole = async (chosenRole: 'INVESTOR' | 'BRAND_ADMIN') => {
    setLoading(true);
    try {
      await updateUserRole(chosenRole);
      onSuccess(chosenRole);
    } catch (err) {
      onSuccess(chosenRole);
    } finally {
      setLoading(false);
    }
  };

  // Quick Demo Login (Discreetly tucked away)
  const handleDemoAccess = async (role: 'INVESTOR' | 'BRAND' | 'ADMIN') => {
    setLoading(true);
    setErrorMsg('');
    try {
      await loginWithRole(role);
      onSuccess(role === 'BRAND' ? 'BRAND_ADMIN' : role === 'ADMIN' ? 'VIZ_ADMIN' : 'INVESTOR');
    } catch (err: any) {
      setErrorMsg(err.message || 'Demo login failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-in fade-in duration-200">
      <div className="relative w-full max-w-md rounded-3xl bg-gradient-to-b from-slate-900 to-[#07090e] border border-slate-800 shadow-2xl p-6 sm:p-8 text-white">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-5 right-5 p-2 rounded-full text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
          aria-label="Close"
        >
          <X className="w-5 h-5" />
        </button>

        {/* ============================================================ */}
        {/* SCREEN 1: Amazon-Style Single Entry Point                    */}
        {/* ============================================================ */}
        {step === 'IDENTIFIER' && (
          <div className="space-y-6">
            <div>
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-blue-500/10 border border-blue-500/30 text-blue-400 text-xs font-bold mb-3">
                <ShieldCheck className="w-3.5 h-3.5" />
                <span>Fast & Secure Access</span>
              </div>
              <h2 className="text-2xl font-black tracking-tight font-['Outfit'] text-white">
                Sign in or sign up
              </h2>
              <p className="text-xs sm:text-sm text-slate-400 mt-1">
                Enter your mobile number or email to start browsing verified franchises immediately.
              </p>
            </div>

            {errorMsg && (
              <div className="p-3 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs">
                {errorMsg}
              </div>
            )}

            <form onSubmit={handleContinueIdentifier} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                  Mobile number or email
                </label>
                <input
                  type="text"
                  value={identifier}
                  onChange={(e) => setIdentifier(e.target.value)}
                  placeholder="e.g. 98888 12345 or investor@example.com"
                  autoFocus
                  required
                  className="w-full px-4 py-3 rounded-xl bg-slate-950 border border-slate-700 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all shadow-inner"
                />
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full py-3.5 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white font-bold text-sm flex items-center justify-center gap-2 shadow-lg shadow-blue-600/30 transition-all hover:scale-[1.01] active:scale-[0.99] disabled:opacity-50"
              >
                <span>{loading ? 'Checking...' : 'Continue'}</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </form>

            <div className="text-[11px] text-slate-500 text-center leading-relaxed">
              By continuing, you agree to VIZ India's Terms of Service and Privacy Policy. No profile questions required upfront.
            </div>

            {/* Tucked Away Demo Persona Access */}
            <div className="pt-3 border-t border-slate-800/80">
              <button
                type="button"
                onClick={() => setShowDemoTuck(!showDemoTuck)}
                className="w-full flex items-center justify-between text-xs text-slate-400 hover:text-slate-200 font-medium py-1 transition-colors"
              >
                <span className="flex items-center gap-1.5">
                  <Zap className="w-3.5 h-3.5 text-amber-400" />
                  <span>Try a demo account (1-click test access)</span>
                </span>
                {showDemoTuck ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
              </button>

              {showDemoTuck && (
                <div className="mt-3 p-3 rounded-2xl bg-slate-950/80 border border-slate-800 grid grid-cols-3 gap-2">
                  <button
                    type="button"
                    onClick={() => handleDemoAccess('INVESTOR')}
                    className="p-2 rounded-xl bg-slate-900 hover:bg-blue-950/50 border border-slate-800 hover:border-blue-500/50 text-left transition-all"
                  >
                    <span className="text-[10px] font-bold text-blue-400 block">Investor</span>
                    <span className="text-[11px] text-slate-300 font-semibold truncate block">Rohit Sharma</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => handleDemoAccess('BRAND')}
                    className="p-2 rounded-xl bg-slate-900 hover:bg-purple-950/50 border border-slate-800 hover:border-purple-500/50 text-left transition-all"
                  >
                    <span className="text-[10px] font-bold text-purple-400 block">Brand Admin</span>
                    <span className="text-[11px] text-slate-300 font-semibold truncate block">Chai Sutta</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => handleDemoAccess('ADMIN')}
                    className="p-2 rounded-xl bg-slate-900 hover:bg-amber-950/50 border border-slate-800 hover:border-amber-500/50 text-left transition-all"
                  >
                    <span className="text-[10px] font-bold text-amber-400 block">Super Admin</span>
                    <span className="text-[11px] text-slate-300 font-semibold truncate block">VIZ Command</span>
                  </button>
                </div>
              )}
            </div>
          </div>
        )}

        {/* ============================================================ */}
        {/* SCREEN 2: Password or OTP (Minimal Credential Only)          */}
        {/* ============================================================ */}
        {step === 'CREDENTIAL' && (
          <div className="space-y-6">
            <button
              type="button"
              onClick={() => {
                setStep('IDENTIFIER');
                setErrorMsg('');
              }}
              className="inline-flex items-center gap-1.5 text-xs text-slate-400 hover:text-white transition-colors"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>Change {identifierType === 'EMAIL' ? 'email' : 'mobile number'}</span>
            </button>

            <div>
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-slate-400">Account:</span>
                <span className="text-xs font-bold text-white bg-slate-800 px-2.5 py-1 rounded-lg">
                  {identifier}
                </span>
              </div>
              <h2 className="text-2xl font-black tracking-tight font-['Outfit'] text-white mt-3">
                {credentialMode === 'PASSWORD'
                  ? isExistingUser
                    ? 'Enter your password'
                    : 'Set a password'
                  : 'Enter 6-digit code'}
              </h2>
              <p className="text-xs text-slate-400 mt-1">
                {credentialMode === 'PASSWORD'
                  ? isExistingUser
                    ? 'Enter the password associated with this account to continue.'
                    : 'Create a password to secure your account. No extra forms.'
                  : `We sent a 6-digit verification code to ${identifier}.`}
              </p>
            </div>

            {errorMsg && (
              <div className="p-3 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs">
                {errorMsg}
              </div>
            )}

            <form onSubmit={handleCredentialSubmit} className="space-y-4">
              {credentialMode === 'PASSWORD' ? (
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                    Password
                  </label>
                  <div className="relative">
                    <input
                      type={showPassword ? 'text' : 'password'}
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder={isExistingUser ? 'Enter your password' : 'At least 6 characters'}
                      autoFocus
                      required
                      className="w-full pl-4 pr-10 py-3 rounded-xl bg-slate-950 border border-slate-700 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all shadow-inner"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-200"
                    >
                      {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                  {!isExistingUser && (
                    <p className="text-[11px] text-slate-500 mt-1.5">
                      Tip: Choose at least 6 characters. You can update details anytime later.
                    </p>
                  )}
                </div>
              ) : (
                <div className="space-y-3">
                  <label className="block text-xs font-semibold text-slate-300">
                    6-Digit Verification Code
                  </label>
                  <input
                    type="text"
                    maxLength={6}
                    value={otpCode}
                    onChange={(e) => setOtpCode(e.target.value.replace(/\D/g, ''))}
                    placeholder="123456"
                    autoFocus
                    required
                    className="w-full text-center tracking-[0.5em] font-mono text-xl py-3 rounded-xl bg-slate-950 border border-slate-700 text-white focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all shadow-inner"
                  />

                  {devOtpHint && (
                    <div className="p-2.5 rounded-xl bg-amber-500/10 border border-amber-500/20 text-xs text-amber-300 flex items-center justify-between">
                      <span>Dev Auto-Fill: <strong>{devOtpHint}</strong></span>
                      <button
                        type="button"
                        onClick={() => setOtpCode(devOtpHint)}
                        className="px-2 py-0.5 rounded bg-amber-500/20 hover:bg-amber-500/30 text-[10px] font-bold uppercase"
                      >
                        Fill
                      </button>
                    </div>
                  )}

                  <div className="flex items-center justify-between text-xs text-slate-400 pt-1">
                    <span>Didn't receive the code?</span>
                    <button
                      type="button"
                      disabled={resendCooldown > 0 || loading}
                      onClick={handleResendOtp}
                      className="text-blue-400 hover:text-blue-300 font-semibold disabled:opacity-40 disabled:hover:text-slate-400"
                    >
                      {resendCooldown > 0 ? `Resend in ${resendCooldown}s` : 'Resend Code'}
                    </button>
                  </div>
                </div>
              )}

              <button
                type="submit"
                disabled={loading}
                className="w-full py-3.5 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white font-bold text-sm flex items-center justify-center gap-2 shadow-lg shadow-blue-600/30 transition-all hover:scale-[1.01] active:scale-[0.99] disabled:opacity-50"
              >
                <span>
                  {loading
                    ? 'Authenticating...'
                    : isExistingUser
                    ? 'Sign In'
                    : 'Create Account & Continue'}
                </span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </form>
          </div>
        )}

        {/* ============================================================ */}
        {/* SCREEN 3: 1-Click Role Selection (Only For New Accounts)     */}
        {/* ============================================================ */}
        {step === 'ROLE_SELECT' && (
          <div className="space-y-6">
            <div className="text-center">
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs font-bold mb-3">
                <Sparkles className="w-3.5 h-3.5" />
                <span>Account Created in 10 Seconds</span>
              </div>
              <h2 className="text-2xl font-black tracking-tight font-['Outfit'] text-white">
                What brings you to VIZ India?
              </h2>
              <p className="text-xs sm:text-sm text-slate-400 mt-1">
                Select your focus with one click to enter the digital floor immediately.
              </p>
            </div>

            <div className="grid grid-cols-1 gap-3.5">
              {/* Option 1: Investor */}
              <button
                type="button"
                disabled={loading}
                onClick={() => handlePickRole('INVESTOR')}
                className="group relative p-4 rounded-2xl bg-slate-950/90 hover:bg-blue-950/30 border border-slate-800 hover:border-blue-500/60 text-left transition-all duration-200 shadow-md hover:shadow-xl hover:shadow-blue-600/10 flex items-start gap-4"
              >
                <div className="w-12 h-12 rounded-2xl bg-blue-600/20 border border-blue-500/30 flex items-center justify-center flex-shrink-0 group-hover:scale-110 transition-transform">
                  <TrendingUp className="w-6 h-6 text-blue-400" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between">
                    <h3 className="text-sm font-bold text-white group-hover:text-blue-300 transition-colors">
                      I want to invest
                    </h3>
                    <ArrowRight className="w-4 h-4 text-slate-500 group-hover:text-blue-400 group-hover:translate-x-1 transition-all" />
                  </div>
                  <p className="text-xs text-slate-400 mt-1 leading-snug">
                    Browse verified franchise booths, inspect AI unit economics, download dossiers, and book founder calls.
                  </p>
                </div>
              </button>

              {/* Option 2: Brand Admin */}
              <button
                type="button"
                disabled={loading}
                onClick={() => handlePickRole('BRAND_ADMIN')}
                className="group relative p-4 rounded-2xl bg-slate-950/90 hover:bg-purple-950/30 border border-slate-800 hover:border-purple-500/60 text-left transition-all duration-200 shadow-md hover:shadow-xl hover:shadow-purple-600/10 flex items-start gap-4"
              >
                <div className="w-12 h-12 rounded-2xl bg-purple-600/20 border border-purple-500/30 flex items-center justify-center flex-shrink-0 group-hover:scale-110 transition-transform">
                  <Building2 className="w-6 h-6 text-purple-400" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between">
                    <h3 className="text-sm font-bold text-white group-hover:text-purple-300 transition-colors">
                      I want to list my brand
                    </h3>
                    <ArrowRight className="w-4 h-4 text-slate-500 group-hover:text-purple-400 group-hover:translate-x-1 transition-all" />
                  </div>
                  <p className="text-xs text-slate-400 mt-1 leading-snug">
                    Launch your digital booth, manage investor lead pipeline with Kanban CRM, and close multi-city franchise deals.
                  </p>
                </div>
              </button>
            </div>

            <p className="text-[11px] text-slate-500 text-center">
              You can explore the entire marketplace regardless of selection.
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

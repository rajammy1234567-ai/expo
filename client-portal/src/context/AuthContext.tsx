import React, { createContext, useContext, useState, useEffect } from 'react';
import { IUser } from '../types';
import { authApi } from '../services/api';

interface AuthContextType {
  user: IUser | null;
  token: string | null;
  loading: boolean;
  role: 'INVESTOR' | 'BRAND_ADMIN' | 'VIZ_ADMIN' | null;
  activePersona: 'INVESTOR' | 'BRAND' | 'ADMIN';
  loginWithPassword: (email: string, password: string) => Promise<{ success: boolean; role?: string; message?: string }>;
  registerUser: (data: {
    name: string;
    email: string;
    phone: string;
    role: string;
    password: string;
    confirmPassword: string;
  }) => Promise<{ success: boolean; devOtp?: string; userId?: string; message?: string }>;
  loginWithRole: (role: 'INVESTOR' | 'BRAND' | 'ADMIN') => Promise<void>;
  loginWithOTP: (phone: string, otp: string, role: string, name?: string) => Promise<boolean>;
  verifyOTPCode: (payload: { phone?: string; email?: string; otp: string; userId?: string; name?: string; role?: string }) => Promise<{ success: boolean; role?: string; message?: string }>;
  logout: () => void;
  savedBrandIds: string[];
  toggleSavedBrand: (brandId: string) => void;
  compareBrandIds: string[];
  toggleCompareBrand: (brandId: string) => void;
  clearCompare: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<IUser | null>(null);
  const [token, setToken] = useState<string | null>(localStorage.getItem('viz_auth_token'));
  const [loading, setLoading] = useState<boolean>(true);
  const [savedBrandIds, setSavedBrandIds] = useState<string[]>([]);
  const [compareBrandIds, setCompareBrandIds] = useState<string[]>([]);

  // Convert user role to persona key
  const getPersonaFromRole = (userRole?: string): 'INVESTOR' | 'BRAND' | 'ADMIN' => {
    if (userRole === 'VIZ_ADMIN' || userRole === 'ADMIN' || userRole === 'VIZ_SUPERADMIN') return 'ADMIN';
    if (userRole === 'BRAND_ADMIN' || userRole === 'BRAND' || userRole === 'BRAND_MEMBER') return 'BRAND';
    return 'INVESTOR';
  };

  const activePersona: 'INVESTOR' | 'BRAND' | 'ADMIN' = getPersonaFromRole(user?.role);
  const role: 'INVESTOR' | 'BRAND_ADMIN' | 'VIZ_ADMIN' | null = (user?.role as any) || null;

  // Initialize Auth deterministically
  useEffect(() => {
    const initAuth = async () => {
      const storedToken = localStorage.getItem('viz_auth_token');
      if (!storedToken) {
        setUser(null);
        setToken(null);
        setLoading(false);
        return;
      }

      try {
        const res = await authApi.getMe();
        if (res.data.success) {
          setUser(res.data.user);
          setToken(storedToken);
        } else {
          localStorage.removeItem('viz_auth_token');
          setToken(null);
          setUser(null);
        }
      } catch (err) {
        localStorage.removeItem('viz_auth_token');
        setToken(null);
        setUser(null);
      } finally {
        setLoading(false);
      }
    };

    initAuth();

    const handleSessionExpired = () => {
      setUser(null);
      setToken(null);
      localStorage.removeItem('viz_auth_token');
    };

    window.addEventListener('viz:session_expired', handleSessionExpired);
    return () => {
      window.removeEventListener('viz:session_expired', handleSessionExpired);
    };
  }, []);

  const loginWithPassword = async (email: string, password: string) => {
    setLoading(true);
    try {
      const res = await authApi.login(email, password);
      if (res.data.success) {
        setUser(res.data.user);
        setToken(res.data.token);
        localStorage.setItem('viz_auth_token', res.data.token);
        return { success: true, role: res.data.role, message: res.data.message };
      }
      return { success: false, message: res.data.message || 'Login failed' };
    } catch (err: any) {
      const msg = err.response?.data?.message || err.message || 'Invalid email or password';
      return { success: false, message: msg };
    } finally {
      setLoading(false);
    }
  };

  const registerUser = async (data: {
    name: string;
    email: string;
    phone: string;
    role: string;
    password: string;
    confirmPassword: string;
  }) => {
    setLoading(true);
    try {
      const res = await authApi.register(data);
      if (res.data.success) {
        return {
          success: true,
          devOtp: res.data.devOtp,
          userId: res.data.userId,
          message: res.data.message,
        };
      }
      return { success: false, message: res.data.message || 'Registration failed' };
    } catch (err: any) {
      const msg = err.response?.data?.message || err.message || 'Registration failed';
      return { success: false, message: msg };
    } finally {
      setLoading(false);
    }
  };

  const verifyOTPCode = async (payload: {
    phone?: string;
    email?: string;
    otp: string;
    userId?: string;
    name?: string;
    role?: string;
  }) => {
    setLoading(true);
    try {
      const res = await authApi.verifyOtp(payload);
      if (res.data.success) {
        setUser(res.data.user);
        setToken(res.data.token);
        localStorage.setItem('viz_auth_token', res.data.token);
        return { success: true, role: res.data.role, message: res.data.message };
      }
      return { success: false, message: res.data.message || 'OTP verification failed' };
    } catch (err: any) {
      const msg = err.response?.data?.message || err.message || 'Invalid OTP code';
      return { success: false, message: msg };
    } finally {
      setLoading(false);
    }
  };

  const loginWithRole = async (targetRole: 'INVESTOR' | 'BRAND' | 'ADMIN') => {
    setLoading(true);
    try {
      const res = await authApi.demoLogin(targetRole);
      if (res.data.success) {
        setUser(res.data.user);
        setToken(res.data.token);
        localStorage.setItem('viz_auth_token', res.data.token);
      }
    } catch (err) {
      console.error('Failed to login with role', err);
    } finally {
      setLoading(false);
    }
  };

  const loginWithOTP = async (phone: string, otp: string, roleChoice: string, name?: string): Promise<boolean> => {
    const result = await verifyOTPCode({ phone, otp, role: roleChoice, name });
    return result.success;
  };

  const logout = () => {
    setUser(null);
    setToken(null);
    localStorage.removeItem('viz_auth_token');
  };

  const toggleSavedBrand = (brandId: string) => {
    setSavedBrandIds((prev) =>
      prev.includes(brandId) ? prev.filter((id) => id !== brandId) : [...prev, brandId]
    );
  };

  const toggleCompareBrand = (brandId: string) => {
    setCompareBrandIds((prev) => {
      if (prev.includes(brandId)) {
        return prev.filter((id) => id !== brandId);
      }
      if (prev.length >= 4) {
        alert('You can compare up to 4 brands at a time.');
        return prev;
      }
      return [...prev, brandId];
    });
  };

  const clearCompare = () => setCompareBrandIds([]);

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        loading,
        role,
        activePersona,
        loginWithPassword,
        registerUser,
        loginWithRole,
        loginWithOTP,
        verifyOTPCode,
        logout,
        savedBrandIds,
        toggleSavedBrand,
        compareBrandIds,
        toggleCompareBrand,
        clearCompare,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

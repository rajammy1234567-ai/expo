import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Image,
  ActivityIndicator,
} from 'react-native';
import {
  Sparkles,
  ShieldCheck,
  CreditCard,
  User,
  Building2,
  Lock,
  Mail,
  Phone,
  KeyRound,
  CheckCircle2,
  Eye,
  EyeOff,
  LogOut,
} from 'lucide-react-native';
import { getBaseUrl } from '../../services/api';

export default function MobileProfileScreen() {
  // Current logged in user state
  const [currentUser, setCurrentUser] = useState<any>({
    name: 'Rohit Sharma',
    email: 'rohit.sharma@gmail.com',
    phone: '+91 98888 12345',
    role: 'INVESTOR',
  });

  const [authModalVisible, setAuthModalVisible] = useState(false);
  const [authTab, setAuthTab] = useState<'LOGIN' | 'REGISTER' | 'OTP'>('LOGIN');

  // Form Fields
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('+91 ');
  const [role, setRole] = useState<'INVESTOR' | 'BRAND'>('INVESTOR');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  // OTP Verification
  const [isOtpStep, setIsOtpStep] = useState(false);
  const [otpCode, setOtpCode] = useState('');
  const [devOtp, setDevOtp] = useState<string | null>(null);

  // Status
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');

  // Password matching validation
  const passwordsMatch = password.length > 0 && password === confirmPassword;
  const isPasswordValid = password.length >= 8 && /[A-Z]/.test(password) && /[0-9]/.test(password);

  const plans = [
    { name: 'FREE', price: '₹0', features: 'Basic browsing, 5 AI queries/day' },
    { name: 'STARTER', price: '₹999 / 3mo', features: 'Advanced matching, direct meetings' },
    { name: 'GROWTH', price: '₹2,999 / 6mo', features: 'Unlimited matching, priority meetings' },
    { name: 'PREMIUM', price: '₹9,999 / yr', features: 'Dedicated RM, unlimited AI & financials' },
  ];

  const handleRegister = async () => {
    if (!isPasswordValid || !passwordsMatch) {
      setMessage('Password must be 8+ chars (1 uppercase, 1 number) and match confirm field.');
      return;
    }
    setLoading(true);
    setMessage('');
    try {
      const res = await fetch(`${getBaseUrl()}/auth/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, email, phone, role, password, confirmPassword }),
      });
      const data = await res.json();
      setLoading(false);
      if (data.success) {
        setIsOtpStep(true);
        if (data.devOtp) {
          setDevOtp(data.devOtp);
          setOtpCode(data.devOtp); // Auto-fill for testing
        }
      } else {
        setMessage(data.message || 'Registration failed');
      }
    } catch (e: any) {
      setLoading(false);
      setMessage(e.message || 'Server connection error');
    }
  };

  const handleLogin = async () => {
    setLoading(true);
    setMessage('');
    try {
      const res = await fetch(`${getBaseUrl()}/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });
      const data = await res.json();
      setLoading(false);
      if (data.success) {
        setCurrentUser(data.user);
        setAuthModalVisible(false);
        setMessage('Welcome back, ' + data.user.name);
      } else {
        setMessage(data.message || 'Invalid email or password');
      }
    } catch (e: any) {
      setLoading(false);
      setMessage(e.message || 'Server connection error');
    }
  };

  const handleVerifyOtp = async () => {
    setLoading(true);
    setMessage('');
    try {
      const res = await fetch(`${getBaseUrl()}/auth/verify-otp`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, otp: otpCode, role, name }),
      });
      const data = await res.json();
      setLoading(false);
      if (data.success) {
        setCurrentUser(data.user);
        setAuthModalVisible(false);
        setIsOtpStep(false);
        setMessage('Account activated successfully!');
      } else {
        setMessage(data.message || 'Invalid OTP');
      }
    } catch (e: any) {
      setLoading(false);
      setMessage(e.message || 'Verification failed');
    }
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      {/* Profile Header */}
      <View style={styles.profileHeader}>
        <Image
          source={{ uri: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=100' }}
          style={styles.avatar}
        />
        <View style={{ flex: 1 }}>
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
            <Text style={styles.name}>{currentUser.name}</Text>
            <View style={styles.roleBadge}>
              <Text style={styles.roleText}>{currentUser.role}</Text>
            </View>
          </View>
          <Text style={styles.city}>{currentUser.email}</Text>
          <Text style={styles.budget}>{currentUser.phone}</Text>
        </View>
        <TouchableOpacity
          onPress={() => setAuthModalVisible(!authModalVisible)}
          style={styles.switchAuthBtn}
        >
          <Text style={styles.switchAuthText}>
            {authModalVisible ? 'Close' : 'Switch / Sign In'}
          </Text>
        </TouchableOpacity>
      </View>

      {/* Auth Card Drawer */}
      {authModalVisible && (
        <View style={styles.authContainer}>
          {/* Tabs */}
          {!isOtpStep && (
            <View style={styles.tabRow}>
              <TouchableOpacity
                onPress={() => { setAuthTab('LOGIN'); setMessage(''); }}
                style={[styles.tabBtn, authTab === 'LOGIN' && styles.tabBtnActive]}
              >
                <Text style={[styles.tabText, authTab === 'LOGIN' && styles.tabTextActive]}>
                  Sign In
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                onPress={() => { setAuthTab('REGISTER'); setMessage(''); }}
                style={[styles.tabBtn, authTab === 'REGISTER' && styles.tabBtnActive]}
              >
                <Text style={[styles.tabText, authTab === 'REGISTER' && styles.tabTextActive]}>
                  Register
                </Text>
              </TouchableOpacity>
            </View>
          )}

          {message ? <Text style={styles.feedbackText}>{message}</Text> : null}

          {/* OTP Step */}
          {isOtpStep ? (
            <View style={{ gap: 10 }}>
              <Text style={styles.label}>Enter 6-Digit Verification Code</Text>
              {devOtp && (
                <View style={styles.devOtpBadge}>
                  <Sparkles size={12} color="#f59e0b" />
                  <Text style={styles.devOtpText}>Dev Mode OTP: {devOtp}</Text>
                </View>
              )}
              <TextInput
                style={styles.input}
                placeholder="123456"
                placeholderTextColor="#64748b"
                keyboardType="numeric"
                maxLength={6}
                value={otpCode}
                onChangeText={setOtpCode}
              />
              <TouchableOpacity
                style={styles.submitBtn}
                onPress={handleVerifyOtp}
                disabled={loading}
              >
                {loading ? (
                  <ActivityIndicator color="#ffffff" />
                ) : (
                  <Text style={styles.submitBtnText}>Verify OTP & Activate</Text>
                )}
              </TouchableOpacity>
            </View>
          ) : authTab === 'LOGIN' ? (
            /* Login View */
            <View style={{ gap: 10 }}>
              <Text style={styles.label}>Work or Personal Email</Text>
              <TextInput
                style={styles.input}
                placeholder="rohit.sharma@gmail.com"
                placeholderTextColor="#64748b"
                autoCapitalize="none"
                keyboardType="email-address"
                value={email}
                onChangeText={setEmail}
              />

              <Text style={styles.label}>Password (Default: Password123)</Text>
              <TextInput
                style={styles.input}
                placeholder="••••••••"
                placeholderTextColor="#64748b"
                secureTextEntry={!showPassword}
                value={password}
                onChangeText={setPassword}
              />

              <TouchableOpacity
                style={styles.submitBtn}
                onPress={handleLogin}
                disabled={loading}
              >
                {loading ? (
                  <ActivityIndicator color="#ffffff" />
                ) : (
                  <Text style={styles.submitBtnText}>Sign In</Text>
                )}
              </TouchableOpacity>
            </View>
          ) : (
            /* Register View */
            <View style={{ gap: 9 }}>
              <Text style={styles.label}>Account Role:</Text>
              <View style={{ flexDirection: 'row', gap: 8 }}>
                <TouchableOpacity
                  onPress={() => setRole('INVESTOR')}
                  style={[styles.roleSelectBtn, role === 'INVESTOR' && styles.roleSelectActive]}
                >
                  <Text style={styles.roleSelectText}>Investor</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  onPress={() => setRole('BRAND')}
                  style={[styles.roleSelectBtn, role === 'BRAND' && styles.roleSelectActive]}
                >
                  <Text style={styles.roleSelectText}>Brand Partner</Text>
                </TouchableOpacity>
              </View>

              <Text style={styles.label}>Full Name</Text>
              <TextInput
                style={styles.input}
                placeholder="e.g. Rahul Sharma"
                placeholderTextColor="#64748b"
                value={name}
                onChangeText={setName}
              />

              <Text style={styles.label}>Email Address</Text>
              <TextInput
                style={styles.input}
                placeholder="rahul@example.com"
                placeholderTextColor="#64748b"
                autoCapitalize="none"
                keyboardType="email-address"
                value={email}
                onChangeText={setEmail}
              />

              <Text style={styles.label}>Mobile Number</Text>
              <TextInput
                style={styles.input}
                placeholder="+91 98888 12345"
                placeholderTextColor="#64748b"
                keyboardType="phone-pad"
                value={phone}
                onChangeText={setPhone}
              />

              <Text style={styles.label}>Password (Min 8 chars, 1 uppercase, 1 number)</Text>
              <TextInput
                style={styles.input}
                placeholder="Password123"
                placeholderTextColor="#64748b"
                secureTextEntry={!showPassword}
                value={password}
                onChangeText={setPassword}
              />

              <Text style={styles.label}>Confirm Password</Text>
              <TextInput
                style={[
                  styles.input,
                  confirmPassword.length > 0 &&
                    (passwordsMatch ? { borderColor: '#10b981' } : { borderColor: '#ef4444' }),
                ]}
                placeholder="Re-enter password"
                placeholderTextColor="#64748b"
                secureTextEntry={!showPassword}
                value={confirmPassword}
                onChangeText={setConfirmPassword}
              />

              {confirmPassword.length > 0 && (
                <Text style={{ fontSize: 10, color: passwordsMatch ? '#10b981' : '#ef4444' }}>
                  {passwordsMatch ? '✓ Passwords match' : '✕ Passwords do not match'}
                </Text>
              )}

              <TouchableOpacity
                style={[styles.submitBtn, (!passwordsMatch || !isPasswordValid) && { opacity: 0.5 }]}
                onPress={handleRegister}
                disabled={loading || !passwordsMatch || !isPasswordValid}
              >
                {loading ? (
                  <ActivityIndicator color="#ffffff" />
                ) : (
                  <Text style={styles.submitBtnText}>Create Account & Verify OTP</Text>
                )}
              </TouchableOpacity>
            </View>
          )}
        </View>
      )}

      {/* Investor Membership Plans */}
      <Text style={styles.sectionTitle}>💳 Investor Membership Plans</Text>
      <View style={styles.plansList}>
        {plans.map((p, i) => (
          <View key={i} style={[styles.planCard, p.name === 'FREE' && styles.activePlan]}>
            <View style={{ flex: 1 }}>
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
                <Text style={styles.planName}>{p.name}</Text>
                {p.name === 'FREE' && <Text style={styles.currTag}>ACTIVE</Text>}
              </View>
              <Text style={styles.planPrice}>{p.price}</Text>
              <Text style={styles.planFeat}>{p.features}</Text>
            </View>
            <TouchableOpacity style={styles.upgradeBtn}>
              <Text style={styles.upgradeText}>{p.name === 'FREE' ? 'Current' : 'Upgrade'}</Text>
            </TouchableOpacity>
          </View>
        ))}
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#07090e' },
  content: { padding: 16, paddingTop: 40, paddingBottom: 30 },
  profileHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    backgroundColor: '#0d121f',
    padding: 16,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#1f293d',
    marginBottom: 16,
  },
  avatar: { width: 52, height: 52, borderRadius: 26, borderWidth: 2, borderColor: '#3b82f6' },
  name: { fontSize: 15, fontWeight: 'bold', color: '#ffffff' },
  roleBadge: {
    backgroundColor: '#1e293b',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: '#3b82f6',
  },
  roleText: { color: '#38bdf8', fontSize: 9, fontWeight: 'bold' },
  city: { fontSize: 11, color: '#94a3b8', marginTop: 2 },
  budget: { fontSize: 10, color: '#10b981', fontWeight: 'bold', marginTop: 2 },
  switchAuthBtn: {
    backgroundColor: '#1e293b',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#334155',
  },
  switchAuthText: { color: '#ffffff', fontSize: 10, fontWeight: 'bold' },

  // Auth drawer
  authContainer: {
    backgroundColor: '#0d121f',
    padding: 16,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#3b82f6',
    marginBottom: 20,
  },
  tabRow: {
    flexDirection: 'row',
    backgroundColor: '#07090e',
    borderRadius: 12,
    padding: 3,
    marginBottom: 14,
  },
  tabBtn: { flex: 1, paddingVertical: 8, alignItems: 'center', borderRadius: 10 },
  tabBtnActive: { backgroundColor: '#2563eb' },
  tabText: { fontSize: 11, fontWeight: 'bold', color: '#94a3b8' },
  tabTextActive: { color: '#ffffff' },
  label: { fontSize: 10, fontWeight: 'bold', color: '#94a3b8', textTransform: 'uppercase' },
  input: {
    backgroundColor: '#07090e',
    borderWidth: 1,
    borderColor: '#1f293d',
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 8,
    color: '#ffffff',
    fontSize: 12,
  },
  submitBtn: {
    backgroundColor: '#2563eb',
    paddingVertical: 11,
    borderRadius: 12,
    alignItems: 'center',
    marginTop: 4,
  },
  submitBtnText: { color: '#ffffff', fontSize: 12, fontWeight: 'bold' },
  feedbackText: { color: '#f59e0b', fontSize: 11, marginBottom: 8, textAlign: 'center' },
  devOtpBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: '#451a03',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
    alignSelf: 'flex-start',
  },
  devOtpText: { color: '#f59e0b', fontSize: 10, fontWeight: 'bold' },
  roleSelectBtn: {
    flex: 1,
    paddingVertical: 8,
    alignItems: 'center',
    backgroundColor: '#07090e',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#1f293d',
  },
  roleSelectActive: { borderColor: '#3b82f6', backgroundColor: '#1e293b' },
  roleSelectText: { color: '#ffffff', fontSize: 11, fontWeight: 'bold' },

  sectionTitle: { fontSize: 14, fontWeight: 'bold', color: '#ffffff', marginBottom: 12 },
  plansList: { gap: 10 },
  planCard: {
    backgroundColor: '#0d121f',
    borderRadius: 16,
    padding: 14,
    borderWidth: 1,
    borderColor: '#1f293d',
    flexDirection: 'row',
    alignItems: 'center',
  },
  activePlan: { borderColor: '#3b82f6' },
  planName: { fontSize: 13, fontWeight: 'bold', color: '#ffffff' },
  currTag: {
    fontSize: 9,
    color: '#3b82f6',
    backgroundColor: '#1e293b',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 6,
    fontWeight: 'bold',
  },
  planPrice: { fontSize: 14, fontWeight: '900', color: '#f59e0b', marginVertical: 2 },
  planFeat: { fontSize: 10, color: '#94a3b8' },
  upgradeBtn: {
    backgroundColor: '#1e293b',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#334155',
  },
  upgradeText: { color: '#ffffff', fontSize: 11, fontWeight: 'bold' },
});

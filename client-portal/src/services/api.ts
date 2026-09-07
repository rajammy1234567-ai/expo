import axios from 'axios';

const API_BASE_URL = (import.meta as any).env?.VITE_API_BASE_URL || 'http://localhost:5000/api';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Attach JWT token from localStorage if present
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('viz_auth_token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Global response interceptor to handle session expiry and unauthorized states
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      const url = error.config?.url || '';
      // Don't intercept intentional credential failures on login/register
      if (!url.includes('/auth/login') && !url.includes('/auth/register')) {
        localStorage.removeItem('viz_auth_token');
        window.dispatchEvent(
          new CustomEvent('viz:session_expired', {
            detail: { message: 'Session expired. Please sign in again to continue.' },
          })
        );
      }
    }
    return Promise.reject(error);
  }
);

export const authApi = {
  login: (email: string, password: string) => api.post('/auth/login', { email, password }),
  register: (data: {
    name: string;
    email: string;
    phone: string;
    role: string;
    password: string;
    confirmPassword: string;
  }) => api.post('/auth/register', data),
  demoLogin: (role: 'INVESTOR' | 'BRAND' | 'ADMIN') => api.post('/auth/demo-login', { role }),
  requestOtp: (phone: string) => api.post('/auth/request-otp', { phone }),
  verifyOtp: (payload: { phone?: string; email?: string; otp: string; name?: string; role?: string; userId?: string }) =>
    api.post('/auth/verify-otp', payload),
  getMe: () => api.get('/auth/me'),
};

export const brandApi = {
  getBrands: (params?: Record<string, any>) => api.get('/brands', { params }),
  getBrandById: (id: string) => api.get(`/brands/${id}`),
  updateBooth: (brandId: string, data: any) => api.put(`/brands/${brandId}/booth`, data),
  addKBChunk: (brandId: string, data: any) => api.post(`/brands/${brandId}/kb`, data),
};

export const investorApi = {
  updateProfile: (data: any) => api.put('/investor/profile', data),
  getMatches: () => api.get('/investor/matches'),
  toggleSave: (brandId: string) => api.post('/investor/save-brand', { brandId }),
  compare: (brandIds: string[]) => api.post('/investor/compare', { brandIds }),
};

export const leadApi = {
  createLead: (brandId: string, source = 'BOOTH_DISCOVERY', note?: string) =>
    api.post('/leads', { brandId, source, note }),
  getBrandLeads: (brandId: string) => api.get(`/leads/brand/${brandId}`),
  updateStage: (leadId: string, status: string, note?: string, closedDealValueINR?: number) =>
    api.put(`/leads/${leadId}/stage`, { status, note, closedDealValueINR }),
  getMyDeals: () => api.get('/leads/my-deals'),
};

export const meetingApi = {
  requestMeeting: (data: { brandId: string; scheduledStartTime?: string; meetingType?: string; notesFromInvestor?: string }) =>
    api.post('/meetings/request', data),
  getMeetings: () => api.get('/meetings'),
  updateStatus: (meetingId: string, status: string, notes?: Record<string, any>) =>
    api.put(`/meetings/${meetingId}/status`, { status, ...notes }),
};

export const dealApi = {
  recordDeal: (data: any) => api.post('/deals/record', data),
  getBrandDeals: (brandId: string) => api.get(`/deals/brand/${brandId}`),
};

export const adminApi = {
  getOverview: () => api.get('/admin/overview'),
  verifyBrand: (brandId: string, data: any) => api.put(`/admin/brand/${brandId}/verify`, data),
  updateCommission: (dealId: string, data: any) => api.put(`/admin/deal/${dealId}/commission`, data),
};

export const aiApi = {
  askBrandAI: (brandId: string, question: string) => api.post('/ai/ask-brand', { brandId, question }),
  matchInvestor: (data: any) => api.post('/ai/match-investor', data),
};

export default api;

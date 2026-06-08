// src/services/api.ts
import axios, { AxiosError } from 'axios';

import Constants from 'expo-constants';

// Auto-detect host IP when running in Expo Go so physical devices can reach the
// backend without editing this file. Falls back to localhost for web/emulator.
const getDevHost = (): string => {
  const manifestAny: any = (Constants as any).manifest || (Constants as any).expoConfig || {};
  const debuggerHost = manifestAny.debuggerHost || manifestAny.hostUri || '';
  if (typeof debuggerHost === 'string' && debuggerHost.includes(':')) {
    return debuggerHost.split(':')[0];
  }
  return 'localhost';
};

export const BASE_URL = process.env.EXPO_PUBLIC_API_URL || `http://${getDevHost()}:4000/api`;

// Debug helper: print resolved backend URL when app starts (remove in production)
try {
  // eslint-disable-next-line no-console
  console.log('BASE_URL', BASE_URL);
} catch (e) {}

const api = axios.create({
  baseURL: BASE_URL,
  timeout: 30_000,
  headers: { 'Content-Type': 'application/json' },
});

// Attach JWT
api.interceptors.request.use(async (config) => {
  const { useAuthStore } = await import('../store/authStore');
  const token = useAuthStore.getState().accessToken;
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

// Handle 401
api.interceptors.response.use(
  (res) => res,
  async (error: AxiosError) => {
    if (error.response?.status === 401) {
      const { useAuthStore } = await import('../store/authStore');
      useAuthStore.getState().logout();
    }
    return Promise.reject(error);
  }
);

export default api;

// ── Auth endpoints ─────────────────────────────────────────────
export const authApi = {
  login:    (email: string, password: string) =>
    api.post('/auth/login', { email, password }),
  register: (name: string, email: string, password: string, mobile?: string) =>
    api.post('/auth/register', { name, email, password, mobile }),
  sendOtp:  (mobile: string) =>
    api.post('/auth/otp/send', { mobile }),
  verifyOtp: (mobile: string, otp: string) =>
    api.post('/auth/otp/verify', { mobile, otp }),
  forgotPassword: (email: string) =>
    api.post('/auth/forgot-password', { email }),
  resetPassword: (email: string, code: string, password: string) =>
    api.post('/auth/reset-password', { email, code, password }),
  me: () => api.get('/auth/me'),
};

// ── Social accounts ────────────────────────────────────────────
export const accountsApi = {
  list:       () => api.get('/accounts'),
  connect:    (platform: string) => api.get(`/accounts/connect/${platform}`),
  disconnect: (id: string) => api.delete(`/accounts/${id}`),
  refresh:    (id: string) => api.post(`/accounts/${id}/refresh`),
};

// ── Posts ──────────────────────────────────────────────────────
export const postsApi = {
  list:    (params?: { status?: string; page?: number; limit?: number }) =>
    api.get('/posts', { params }),
  get:     (id: string) => api.get(`/posts/${id}`),
  publish: (payload: {
    text: string; hashtags: string[]; mediaIds: string[];
    targets: { socialAccountId: string; platform: string; customText?: string }[];
    scheduledAt?: string;
  }) => api.post('/posts/publish', payload),
  draft:   (payload: unknown) => api.post('/posts/draft', payload),
  delete:  (id: string)       => api.delete(`/posts/${id}`),
  retry:   (id: string, targetIds: string[]) => api.post(`/posts/${id}/retry`, { targetIds }),
};

// ── Media ──────────────────────────────────────────────────────
export const mediaApi = {
  list:   () => api.get('/media'),
  upload: async (file: { uri: string; name: string; type: string }, onProgress?: (pct: number) => void) => {
    const form = new FormData();
    form.append('files', { uri: file.uri, name: file.name, type: file.type } as any);
    return api.post('/media/upload', form, {
      headers: { 'Content-Type': 'multipart/form-data' },
      onUploadProgress: (e) => {
        if (e.total && onProgress) onProgress(Math.round((e.loaded * 100) / e.total));
      },
    });
  },
  delete: (id: string) => api.delete(`/media/${id}`),
};

// ── Analytics ──────────────────────────────────────────────────
export const analyticsApi = {
  summary: (from?: string, to?: string) => api.get('/analytics/summary', { params: { from, to } }),
  post:    (postId: string)             => api.get(`/analytics/posts/${postId}`),
  export:  ()                           => api.get('/analytics/export', { responseType: 'blob' }),
};

// ── Billing ────────────────────────────────────────────────────
export const billingApi = {
  subscription: () => api.get('/billing/subscription'),
  subscribe:    (plan: string) => api.post('/billing/subscribe', { plan }),
  cancel:       () => api.post('/billing/cancel'),
  invoices:     () => api.get('/billing/invoices'),
};

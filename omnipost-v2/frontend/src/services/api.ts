import axios, { AxiosError } from 'axios';
import type { ApiResponse, ApiError } from '@/types';
import { useAuthStore } from '@/store/authStore';

/* ================================================================
   Axios Instance — base URL points to backend
   Replace BASE_URL with your deployed backend endpoint
   ================================================================ */
const BASE_URL = import.meta.env.VITE_API_URL || '/api';

export const api = axios.create({
  baseURL: BASE_URL,
  timeout: 30_000,
  headers: { 'Content-Type': 'application/json' },
});

/* ─── Request interceptor: attach JWT ───────────────────────────── */
api.interceptors.request.use((config) => {
  const token = useAuthStore.getState().accessToken;
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

/* ─── Response interceptor: handle 401 ─────────────────────────── */
api.interceptors.response.use(
  (res) => res,
  (error: AxiosError<ApiError>) => {
    if (error.response?.status === 401) {
      useAuthStore.getState().logout();
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

/* ─── Generic fetchers ───────────────────────────────────────────── */
export async function get<T>(url: string, params?: Record<string, unknown>): Promise<T> {
  const { data } = await api.get<ApiResponse<T>>(url, { params });
  return data.data;
}

export async function post<T>(url: string, body?: unknown): Promise<T> {
  const { data } = await api.post<ApiResponse<T>>(url, body);
  return data.data;
}

export async function put<T>(url: string, body?: unknown): Promise<T> {
  const { data } = await api.put<ApiResponse<T>>(url, body);
  return data.data;
}

export async function patch<T>(url: string, body?: unknown): Promise<T> {
  const { data } = await api.patch<ApiResponse<T>>(url, body);
  return data.data;
}

export async function del<T>(url: string): Promise<T> {
  const { data } = await api.delete<ApiResponse<T>>(url);
  return data.data;
}

/* ─── File upload ────────────────────────────────────────────────── */
export async function uploadFile<T>(url: string, file: File, onProgress?: (pct: number) => void): Promise<T> {
  const form = new FormData();
  form.append('file', file);
  const { data } = await api.post<ApiResponse<T>>(url, form, {
    headers: { 'Content-Type': 'multipart/form-data' },
    onUploadProgress: (e) => {
      if (e.total && onProgress) onProgress(Math.round((e.loaded * 100) / e.total));
    },
  });
  return data.data;
}

// src/hooks/index.ts — TanStack Query hooks for mobile
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { authApi, accountsApi, postsApi, mediaApi, analyticsApi, billingApi } from '../services/api';
import Toast from 'react-native-toast-message';
import type { User, SocialAccount, Post, AnalyticsSummary, MediaAsset, Subscription } from '../types';

/* ── Query keys ─────────────────────────────────────────────── */
export const QK = {
  me:          ['me'],
  accounts:    ['accounts'],
  posts:       (s?: string) => s ? ['posts', s] : ['posts'],
  post:        (id: string) => ['post', id],
  analytics:   (from?: string, to?: string) => ['analytics', from, to],
  media:       ['media'],
  subscription:['subscription'],
};

/* ── Auth ────────────────────────────────────────────────────── */
export function useCurrentUser() {
  return useQuery<User>({
    queryKey: QK.me,
    queryFn:  async () => {
      const res = await authApi.me();
      return res.data.data;
    },
    staleTime: 10 * 60 * 1000,
  });
}

/* ── Social Accounts ─────────────────────────────────────────── */
export function useSocialAccounts() {
  return useQuery<SocialAccount[]>({
    queryKey: QK.accounts,
    queryFn:  async () => {
      const res = await accountsApi.list();
      return res.data.data;
    },
  });
}

export function useDisconnectAccount() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => accountsApi.disconnect(id),
    onSuccess:  () => {
      qc.invalidateQueries({ queryKey: QK.accounts });
      Toast.show({ type: 'success', text1: 'Account disconnected' });
    },
    onError: () => Toast.show({ type: 'error', text1: 'Failed to disconnect' }),
  });
}

export function useRefreshToken() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => accountsApi.refresh(id),
    onSuccess:  () => {
      qc.invalidateQueries({ queryKey: QK.accounts });
      Toast.show({ type: 'success', text1: 'Token refreshed!' });
    },
    onError: () => Toast.show({ type: 'error', text1: 'Token refresh failed' }),
  });
}

/* ── Posts ───────────────────────────────────────────────────── */
export function usePosts(status?: string) {
  return useQuery({
    queryKey: QK.posts(status),
    queryFn:  async () => {
      const res = await postsApi.list({ status, limit: 50 });
      return res.data.data;
    },
  });
}

export function usePublishPost() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: postsApi.publish,
    onSuccess: (res) => {
      qc.invalidateQueries({ queryKey: QK.posts() });
      const status = res.data.data.status;
      if (status === 'scheduled') {
        Toast.show({ type: 'success', text1: 'Post scheduled! 🕐' });
      } else {
        Toast.show({ type: 'success', text1: 'Publishing to all platforms! 🚀' });
      }
    },
    onError: () => Toast.show({ type: 'error', text1: 'Publishing failed. Please retry.' }),
  });
}

export function useSaveDraft() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: postsApi.draft,
    onSuccess:  () => {
      qc.invalidateQueries({ queryKey: QK.posts('draft') });
      Toast.show({ type: 'success', text1: 'Draft saved' });
    },
  });
}

export function useDeletePost() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: postsApi.delete,
    onSuccess:  () => {
      qc.invalidateQueries({ queryKey: QK.posts() });
      Toast.show({ type: 'success', text1: 'Post deleted' });
    },
    onError: () => Toast.show({ type: 'error', text1: 'Failed to delete post' }),
  });
}

/* ── Analytics ───────────────────────────────────────────────── */
export function useAnalytics(from?: string, to?: string) {
  return useQuery<AnalyticsSummary>({
    queryKey: QK.analytics(from, to),
    queryFn:  async () => {
      const res = await analyticsApi.summary(from, to);
      return res.data.data;
    },
    staleTime: 5 * 60 * 1000,
  });
}

/* ── Media ───────────────────────────────────────────────────── */
export function useMediaLibrary() {
  return useQuery<MediaAsset[]>({
    queryKey: QK.media,
    queryFn:  async () => {
      const res = await mediaApi.list();
      return res.data.data;
    },
  });
}

export function useUploadMedia(onProgress?: (pct: number) => void) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (file: { uri: string; name: string; type: string }) =>
      mediaApi.upload(file, onProgress),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: QK.media });
      Toast.show({ type: 'success', text1: 'File uploaded!' });
    },
    onError: () => Toast.show({ type: 'error', text1: 'Upload failed' }),
  });
}

/* ── Billing ─────────────────────────────────────────────────── */
export function useSubscription() {
  return useQuery<Subscription>({
    queryKey: QK.subscription,
    queryFn:  async () => {
      const res = await billingApi.subscription();
      return res.data.data;
    },
  });
}

export function useUpgradePlan() {
  return useMutation({
    mutationFn: (plan: string) => billingApi.subscribe(plan),
    onSuccess: () => Toast.show({ type: 'success', text1: 'Redirecting to Razorpay…' }),
    onError:   () => Toast.show({ type: 'error', text1: 'Payment failed' }),
  });
}

// src/hooks/index.ts  — Custom React Query hooks for all API calls

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { get, post, del, uploadFile } from '../services/api';
import type {
  User, SocialAccount, Post, AnalyticsSummary,
  MediaAsset, HashtagSet, Subscription, AppNotification,
} from '../types';

/* ── Auth ─────────────────────────────────────────────────────── */
export function useMe() {
  return useQuery<User>({
    queryKey: ['me'],
    queryFn:  () => get<User>('/auth/me'),
    staleTime: 1000 * 60 * 5,
  });
}

/* ── Social Accounts ─────────────────────────────────────────── */
export function useSocialAccounts() {
  return useQuery<SocialAccount[]>({
    queryKey: ['accounts'],
    queryFn:  () => get<SocialAccount[]>('/accounts'),
  });
}

export function useDisconnectAccount() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (accountId: string) => del(`/accounts/${accountId}`),
    onSuccess:  () => qc.invalidateQueries({ queryKey: ['accounts'] }),
  });
}

/* ── Posts ────────────────────────────────────────────────────── */
export function usePosts(status?: string) {
  return useQuery<Post[]>({
    queryKey: ['posts', status],
    queryFn:  () => get<Post[]>('/posts', status ? { status } : undefined),
  });
}

export function usePublishPost() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (payload: {
      text: string;
      hashtags: string[];
      mediaIds: string[];
      targets: { socialAccountId: string; platform: string; customText?: string }[];
      scheduledAt?: string;
    }) => post<{ postId: string; status: string }>('/posts/publish', payload),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['posts'] });
      qc.invalidateQueries({ queryKey: ['analytics'] });
    },
  });
}

export function useSaveDraft() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (draft: unknown) => post('/posts/draft', draft),
    onSuccess:  () => qc.invalidateQueries({ queryKey: ['posts', 'draft'] }),
  });
}

export function useDeletePost() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (postId: string) => del(`/posts/${postId}`),
    onSuccess:  () => qc.invalidateQueries({ queryKey: ['posts'] }),
  });
}

/* ── Media ────────────────────────────────────────────────────── */
export function useMedia(type?: string) {
  return useQuery<MediaAsset[]>({
    queryKey: ['media', type],
    queryFn:  () => get<MediaAsset[]>('/media', type ? { type } : undefined),
  });
}

export function useUploadMedia() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ file, onProgress }: { file: File; onProgress?: (pct: number) => void }) =>
      uploadFile<MediaAsset>('/media/upload', file, onProgress),
    onSuccess:  () => qc.invalidateQueries({ queryKey: ['media'] }),
  });
}

export function useDeleteMedia() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (assetId: string) => del(`/media/${assetId}`),
    onSuccess:  () => qc.invalidateQueries({ queryKey: ['media'] }),
  });
}

/* ── Analytics ────────────────────────────────────────────────── */
export function useAnalytics(from?: string, to?: string) {
  return useQuery<AnalyticsSummary>({
    queryKey: ['analytics', from, to],
    queryFn:  () => get<AnalyticsSummary>('/analytics/summary', { from, to }),
    staleTime: 1000 * 60 * 10,
  });
}

/* ── Notifications ────────────────────────────────────────────── */
export function useNotifications() {
  return useQuery<AppNotification[]>({
    queryKey: ['notifications'],
    queryFn:  () => get<AppNotification[]>('/notifications'),
    refetchInterval: 1000 * 60, // poll every minute
  });
}

/* ── Hashtag Sets ─────────────────────────────────────────────── */
export function useHashtagSets() {
  return useQuery<HashtagSet[]>({
    queryKey: ['hashtagSets'],
    queryFn:  () => get<HashtagSet[]>('/hashtag-sets'),
  });
}

/* ── Billing / Subscription ───────────────────────────────────── */
export function useSubscription() {
  return useQuery<Subscription>({
    queryKey: ['subscription'],
    queryFn:  () => get<Subscription>('/billing/subscription'),
  });
}

export function useSubscribePlan() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (plan: string) => post<{ paymentUrl: string }>('/billing/subscribe', { plan }),
    onSuccess:  () => qc.invalidateQueries({ queryKey: ['subscription'] }),
  });
}

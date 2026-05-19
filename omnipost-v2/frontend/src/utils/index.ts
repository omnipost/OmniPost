// src/utils/index.ts — shared utility functions

import { type ClassValue, clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';
import { format, formatDistanceToNow, isToday, isYesterday } from 'date-fns';

/* ── Tailwind class merger ─────────────────────────────────────── */
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/* ── Number formatting ─────────────────────────────────────────── */
export function fmtNum(n: number): string {
  if (n >= 10_000_000) return (n / 1_000_000).toFixed(1) + 'M';
  if (n >= 1_000_000)  return (n / 1_000_000).toFixed(2) + 'M';
  if (n >= 10_000)     return (n / 1_000).toFixed(0) + 'K';
  if (n >= 1_000)      return (n / 1_000).toFixed(1) + 'K';
  return n.toLocaleString('en-IN');
}

export function fmtINR(n: number): string {
  return '₹' + n.toLocaleString('en-IN');
}

export function fmtBytes(bytes: number): string {
  if (bytes >= 1_000_000_000) return (bytes / 1_000_000_000).toFixed(1) + ' GB';
  if (bytes >= 1_000_000)     return (bytes / 1_000_000).toFixed(1) + ' MB';
  if (bytes >= 1_000)         return (bytes / 1_000).toFixed(1) + ' KB';
  return bytes + ' B';
}

/* ── Date formatting ───────────────────────────────────────────── */
export function fmtDate(iso: string): string {
  const d = new Date(iso);
  if (isToday(d))     return 'Today, ' + format(d, 'h:mm a');
  if (isYesterday(d)) return 'Yesterday, ' + format(d, 'h:mm a');
  return format(d, 'MMM d, yyyy · h:mm a');
}

export function fmtRelative(iso: string): string {
  return formatDistanceToNow(new Date(iso), { addSuffix: true });
}

export function fmtScheduled(iso: string): string {
  return format(new Date(iso), "EEE, MMM d 'at' h:mm a");
}

/* ── String helpers ────────────────────────────────────────────── */
export function truncate(str: string, len = 60): string {
  return str.length > len ? str.slice(0, len).trimEnd() + '…' : str;
}

export function capitalise(str: string): string {
  return str.charAt(0).toUpperCase() + str.slice(1);
}

export function slugify(str: string): string {
  return str.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
}

/* ── Hashtag helpers ───────────────────────────────────────────── */
export function cleanHashtag(raw: string): string {
  return raw.replace(/^#/, '').trim().toLowerCase().replace(/\s+/g, '');
}

export function hashtagsToString(tags: string[]): string {
  return tags.map(t => (t.startsWith('#') ? t : `#${t}`)).join(' ');
}

export function extractHashtags(text: string): string[] {
  const matches = text.match(/#[a-zA-Z0-9_]+/g) ?? [];
  return [...new Set(matches.map(t => t.slice(1).toLowerCase()))];
}

/* ── Platform helpers ──────────────────────────────────────────── */
export function charCount(text: string, hashtags: string[]): number {
  const full = text + (hashtags.length ? '\n\n' + hashtags.map(t => `#${t}`).join(' ') : '');
  return full.length;
}

export function isOverLimit(text: string, hashtags: string[], limit: number): boolean {
  return charCount(text, hashtags) > limit;
}

/* ── File helpers ──────────────────────────────────────────────── */
export function getFileType(file: File): 'image' | 'video' | 'audio' | 'other' {
  if (file.type.startsWith('image/')) return 'image';
  if (file.type.startsWith('video/')) return 'video';
  if (file.type.startsWith('audio/')) return 'audio';
  return 'other';
}

export function validateMediaFile(file: File, maxMb = 500): string | null {
  const maxBytes = maxMb * 1_000_000;
  if (file.size > maxBytes) return `File too large. Max ${maxMb} MB allowed.`;
  const allowed  = ['image/jpeg','image/png','image/gif','image/webp','video/mp4','video/quicktime','audio/mpeg','audio/wav'];
  if (!allowed.includes(file.type)) return `File type ${file.type} not supported.`;
  return null;
}

/* ── API helpers ───────────────────────────────────────────────── */
export function getErrorMessage(err: unknown): string {
  if (typeof err === 'string') return err;
  if (err && typeof err === 'object' && 'message' in err) return String((err as any).message);
  return 'An unexpected error occurred';
}

/* ── Local storage helpers ─────────────────────────────────────── */
export function lsGet<T>(key: string, fallback: T): T {
  try {
    const v = localStorage.getItem(key);
    return v ? (JSON.parse(v) as T) : fallback;
  } catch {
    return fallback;
  }
}

export function lsSet(key: string, value: unknown): void {
  try { localStorage.setItem(key, JSON.stringify(value)); } catch { /* noop */ }
}

/* ── Debounce ──────────────────────────────────────────────────── */
export function debounce<T extends (...args: unknown[]) => void>(fn: T, ms: number): T {
  let timer: ReturnType<typeof setTimeout>;
  return ((...args: unknown[]) => {
    clearTimeout(timer);
    timer = setTimeout(() => fn(...args), ms);
  }) as T;
}

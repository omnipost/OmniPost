// src/utils/index.ts — Shared utilities

/* ── Number formatting ─────────────────────────────────────────── */
export function fmtNum(n: number): string {
  if (n >= 10_000_000) return (n / 1_000_000).toFixed(1) + 'M';
  if (n >= 1_000_000)  return (n / 1_000_000).toFixed(2) + 'M';
  if (n >= 10_000)     return (n / 1_000).toFixed(0) + 'K';
  if (n >= 1_000)      return (n / 1_000).toFixed(1) + 'K';
  return n.toLocaleString('en-IN');
}

export function fmtINR(amount: number): string {
  return '₹' + amount.toLocaleString('en-IN');
}

export function fmtBytes(bytes: number): string {
  if (bytes >= 1_000_000_000) return (bytes / 1_000_000_000).toFixed(1) + ' GB';
  if (bytes >= 1_000_000)     return (bytes / 1_000_000).toFixed(1) + ' MB';
  if (bytes >= 1_000)         return (bytes / 1_000).toFixed(0) + ' KB';
  return bytes + ' B';
}

/* ── String helpers ────────────────────────────────────────────── */
export function truncate(str: string, len = 80): string {
  return str.length > len ? str.slice(0, len).trimEnd() + '…' : str;
}

export function capitalise(str: string): string {
  return str.charAt(0).toUpperCase() + str.slice(1);
}

/* ── Hashtag helpers ───────────────────────────────────────────── */
export function cleanHashtag(raw: string): string {
  return raw.replace(/^#/, '').trim().toLowerCase().replace(/\s+/g, '');
}

export function charCount(text: string, hashtags: string[]): number {
  const full = text + (hashtags.length ? '\n\n' + hashtags.map(t => `#${t}`).join(' ') : '');
  return full.length;
}

export function isOverLimit(text: string, hashtags: string[], limit: number): boolean {
  return charCount(text, hashtags) > limit;
}

/* ── Date helpers ──────────────────────────────────────────────── */
export function fmtRelative(iso: string): string {
  const diffMs  = Date.now() - new Date(iso).getTime();
  const diffMin = Math.floor(diffMs / 60_000);
  if (diffMin < 1)  return 'Just now';
  if (diffMin < 60) return `${diffMin}m ago`;
  const diffHr  = Math.floor(diffMin / 60);
  if (diffHr < 24) return `${diffHr}h ago`;
  const diffDay = Math.floor(diffHr / 24);
  if (diffDay < 7) return `${diffDay}d ago`;
  return new Date(iso).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' });
}

/* ── Validation ────────────────────────────────────────────────── */
export function isValidEmail(email: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

export function isValidMobile(mobile: string): boolean {
  return /^[6-9]\d{9}$/.test(mobile.replace(/\s/g, ''));
}

export function isStrongPassword(password: string): boolean {
  return password.length >= 8 &&
    /[A-Z]/.test(password) &&
    /[a-z]/.test(password) &&
    /[0-9]/.test(password) &&
    /[^A-Za-z0-9]/.test(password);
}

/* ── Platform helpers ──────────────────────────────────────────── */
export function getPlatformCharLimit(platformId: string): number {
  const limits: Record<string, number> = {
    instagram: 2200, facebook: 63206, twitter: 280,
    youtube: 5000, linkedin: 3000, threads: 500,
    sharechat: 500, moj: 300, telegram: 4096,
    whatsapp: 4096, pinterest: 500, snapchat: 250,
  };
  return limits[platformId] ?? 2200;
}

/* ── Error handling ────────────────────────────────────────────── */
export function getErrorMessage(err: unknown): string {
  if (typeof err === 'string') return err;
  if (err && typeof err === 'object') {
    const e = err as any;
    return e.response?.data?.error ?? e.message ?? 'An unexpected error occurred';
  }
  return 'An unexpected error occurred';
}

/* ── Debounce ──────────────────────────────────────────────────── */
export function debounce<T extends (...args: any[]) => void>(fn: T, ms: number): T {
  let timer: ReturnType<typeof setTimeout>;
  return ((...args: any[]) => {
    clearTimeout(timer);
    timer = setTimeout(() => fn(...args), ms);
  }) as T;
}

/* ================================================================
   OmniPost — Core TypeScript Types
   ================================================================ */

// ─── Platform ────────────────────────────────────────────────────
export type PlatformId =
  | 'instagram' | 'facebook' | 'twitter' | 'youtube'
  | 'linkedin'  | 'threads'  | 'sharechat' | 'moj'
  | 'pinterest' | 'telegram' | 'whatsapp'  | 'snapchat';

export interface Platform {
  id:          PlatformId;
  name:        string;
  color:       string;
  bgColor:     string;
  icon:        string; // emoji or icon name
  phase:       1 | 2;
  maxChars?:   number;    // text character limit
  mediaTypes:  ('image' | 'video' | 'audio' | 'carousel' | 'story' | 'reel' | 'short')[];
  maxImages?:  number;    // for carousels
  maxVideoMb?: number;    // MB limit
  supportsScheduling: boolean;
  requiresBusinessAccount?: boolean;
  contentTypes: ContentType[];
}

export type ContentType =
  | 'post' | 'story' | 'reel' | 'carousel' | 'video'
  | 'short' | 'thread' | 'article' | 'pin' | 'message';

// ─── User ────────────────────────────────────────────────────────
export interface User {
  id:            string;
  name:          string;
  email:         string;
  mobile?:       string;
  avatar?:       string;
  bio?:          string;
  plan:          SubscriptionPlan;
  language:      'en' | 'hi';
  createdAt:     string;
  isVerified:    boolean;
}

export type SubscriptionPlan = 'free' | 'creator' | 'agency';

// ─── Social Account ──────────────────────────────────────────────
export interface SocialAccount {
  id:             string;
  userId:         string;
  platform:       PlatformId;
  platformUserId: string;
  username:       string;
  displayName:    string;
  avatar?:        string;
  status:         'connected' | 'expired' | 'disconnected' | 'error';
  connectedAt:    string;
  tokenExpiresAt?: string;
  followersCount?: number;
  accountType?:   'personal' | 'business' | 'creator';
}

// ─── Post ────────────────────────────────────────────────────────
export type PostStatus =
  | 'draft' | 'scheduled' | 'publishing' | 'published'
  | 'partial' | 'failed';

export interface PostTarget {
  id:               string;
  socialAccountId:  string;
  platform:         PlatformId;
  platformPostId?:  string;
  status:           'pending' | 'publishing' | 'success' | 'failed';
  errorMessage?:    string;
  publishedAt?:     string;
  postUrl?:         string;
  // Platform-specific overrides
  customText?:      string;
  customHashtags?:  string[];
  customMedia?:     MediaAsset[];
  // Analytics snapshot
  likes?:     number;
  comments?:  number;
  shares?:    number;
  reach?:     number;
  impressions?: number;
}

export interface Post {
  id:           string;
  userId:       string;
  text:         string;
  hashtags:     string[];
  media:        MediaAsset[];
  targets:      PostTarget[];
  status:       PostStatus;
  scheduledAt?: string;
  publishedAt?: string;
  createdAt:    string;
  updatedAt:    string;
}

// ─── Media ───────────────────────────────────────────────────────
export type MediaType = 'image' | 'video' | 'audio' | 'gif';

export interface MediaAsset {
  id:        string;
  userId:    string;
  url:       string;
  thumbUrl?: string;
  type:      MediaType;
  filename:  string;
  size:      number; // bytes
  width?:    number;
  height?:   number;
  duration?: number; // seconds for video/audio
  alt?:      string;
  uploadedAt: string;
  tags?:     string[];
}

// ─── Analytics ───────────────────────────────────────────────────
export interface PlatformAnalytics {
  platform:    PlatformId;
  impressions: number;
  reach:       number;
  likes:       number;
  comments:    number;
  shares:      number;
  saves?:      number;
  clicks?:     number;
  engagementRate: number; // percentage
  followersGrowth: number;
  topPost?:    Post;
}

export interface AnalyticsSummary {
  dateRange:      { from: string; to: string };
  totalPosts:     number;
  totalReach:     number;
  totalImpressions: number;
  totalEngagement: number;
  avgEngagementRate: number;
  platforms:      PlatformAnalytics[];
  dailyData:      DailyAnalytics[];
  topHashtags:    { tag: string; count: number; reach: number }[];
  bestPostTime:   { platform: PlatformId; hour: number; day: string }[];
}

export interface DailyAnalytics {
  date:        string;
  posts:       number;
  impressions: number;
  reach:       number;
  engagement:  number;
}

// ─── Hashtag Set ─────────────────────────────────────────────────
export interface HashtagSet {
  id:       string;
  userId:   string;
  name:     string;
  tags:     string[];
  useCount: number;
  createdAt: string;
}

// ─── Notification ─────────────────────────────────────────────────
export type NotificationType =
  | 'post_success' | 'post_failed' | 'post_partial'
  | 'token_expired' | 'scheduled_reminder'
  | 'feature_announcement' | 'billing';

export interface AppNotification {
  id:        string;
  userId:    string;
  type:      NotificationType;
  title:     string;
  message:   string;
  isRead:    boolean;
  actionUrl?: string;
  createdAt: string;
  metadata?: Record<string, unknown>;
}

// ─── Subscription ─────────────────────────────────────────────────
export interface Subscription {
  id:         string;
  userId:     string;
  plan:       SubscriptionPlan;
  status:     'active' | 'cancelled' | 'past_due' | 'trialing';
  startDate:  string;
  endDate:    string;
  amount:     number; // INR
  currency:   'INR';
  nextBillDate?: string;
  trialEndsAt?: string;
}

export interface PlanFeatures {
  connectedAccounts: number | 'unlimited';
  postsPerMonth:     number | 'unlimited';
  scheduling:        boolean;
  analytics:         'basic' | 'advanced' | 'full';
  draftStorage:      number | 'unlimited';
  teamMembers:       number;
  mediaStorageGb:    number;
  hashtagSets:       number | 'unlimited';
  prioritySupport:   boolean | 'email' | 'phone+email';
  priceMonthly:      number; // INR
  priceAnnually:     number; // INR
}

// ─── API Response wrappers ────────────────────────────────────────
export interface ApiResponse<T> {
  success:  boolean;
  data:     T;
  message?: string;
  pagination?: {
    total:    number;
    page:     number;
    limit:    number;
    hasMore:  boolean;
  };
}

export interface ApiError {
  success: false;
  error:   string;
  code?:   string;
  details?: Record<string, string[]>;
}

// ─── Store / Auth ────────────────────────────────────────────────
export interface AuthState {
  user:            User | null;
  accessToken:     string | null;
  isAuthenticated: boolean;
  isLoading:       boolean;
}

// ─── Composer Draft ───────────────────────────────────────────────
export interface ComposerState {
  text:              string;
  hashtags:          string[];
  media:             MediaAsset[];
  selectedAccounts:  string[]; // SocialAccount IDs
  customizations:    Record<string, Partial<PostTarget>>; // accountId -> overrides
  scheduledAt?:      string;
  isCustomizing:     boolean;
}

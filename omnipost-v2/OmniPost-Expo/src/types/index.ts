// src/types/index.ts

export type PlatformId =
  | 'instagram' | 'facebook' | 'twitter' | 'youtube'
  | 'linkedin'  | 'threads'  | 'sharechat' | 'moj'
  | 'telegram'  | 'whatsapp' | 'pinterest' | 'snapchat';

export type SubscriptionPlan = 'free' | 'creator' | 'agency';

export interface User {
  id:          string;
  name:        string;
  email:       string;
  mobile?:     string;
  avatar?:     string;
  bio?:        string;
  plan:        SubscriptionPlan;
  isVerified:  boolean;
  createdAt:   string;
}

export interface SocialAccount {
  id:             string;
  platform:       PlatformId;
  username:       string;
  displayName:    string;
  avatar?:        string;
  followersCount: number;
  status:         'connected' | 'expired' | 'disconnected';
  accountType:    'personal' | 'business' | 'creator';
}

export type PostStatus = 'draft' | 'scheduled' | 'publishing' | 'published' | 'partial' | 'failed';

export interface PostTarget {
  id:              string;
  platform:        PlatformId;
  accountId:       string;
  status:          'pending' | 'success' | 'failed';
  platformPostId?: string;
  postUrl?:        string;
  errorMessage?:   string;
  likes?:          number;
  comments?:       number;
  reach?:          number;
}

export interface Post {
  id:           string;
  text:         string;
  hashtags:     string[];
  media:        MediaAsset[];
  targets:      PostTarget[];
  status:       PostStatus;
  scheduledAt?: string;
  publishedAt?: string;
  createdAt:    string;
}

export interface MediaAsset {
  id:         string;
  url:        string;
  thumbUrl?:  string;
  type:       'image' | 'video' | 'audio';
  filename:   string;
  size:       number;
  width?:     number;
  height?:    number;
  duration?:  number;
  uploadedAt: string;
}

export interface HashtagSet {
  id:       string;
  name:     string;
  tags:     string[];
  useCount: number;
}

export interface AnalyticsSummary {
  totalPosts:        number;
  totalReach:        number;
  totalImpressions:  number;
  totalEngagement:   number;
  avgEngagementRate: number;
  platforms:         PlatformAnalytics[];
}

export interface PlatformAnalytics {
  platform:        PlatformId;
  impressions:     number;
  reach:           number;
  likes:           number;
  comments:        number;
  shares:          number;
  engagementRate:  number;
  followersGrowth: number;
}

export interface Notification {
  id:        string;
  type:      'post_success' | 'post_failed' | 'token_expired' | 'scheduled_reminder' | 'billing';
  title:     string;
  message:   string;
  isRead:    boolean;
  createdAt: string;
}

// Navigation types
export type RootStackParamList = {
  Splash:          undefined;
  Login:           undefined;
  Register:        undefined;
  ForgotPassword:  undefined;
  ResetPassword:   { email: string };
  OTPVerify:       { mobile: string };
  Onboarding:      undefined;
  Main:            undefined;
};

export type MainTabParamList = {
  Dashboard: undefined;
  Compose:   undefined;
  Calendar:  undefined;
  Analytics: undefined;
  Media:     undefined;
  Profile:   undefined;
};

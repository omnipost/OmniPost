// src/services/mockData.ts
import type { User, SocialAccount, Post, AnalyticsSummary, HashtagSet, MediaAsset, Notification } from '../types';

export const MOCK_USER: User = {
  id: 'usr_01', name: 'Priya Sharma', email: 'demo@omnipost.in',
  mobile: '+919876543210', plan: 'creator', isVerified: true,
  bio: 'Content creator & lifestyle influencer 🌸',
  createdAt: '2024-01-15T10:30:00Z',
};

export const MOCK_ACCOUNTS: SocialAccount[] = [
  { id: 'a1', platform: 'instagram', username: '@priya.creates',      displayName: 'Priya Creates',         followersCount: 124500, status: 'connected', accountType: 'creator'  },
  { id: 'a2', platform: 'twitter',   username: '@priyasharma',        displayName: 'Priya Sharma',          followersCount: 18200,  status: 'connected', accountType: 'personal' },
  { id: 'a3', platform: 'facebook',  username: 'Priya Sharma Official',displayName: 'Priya Sharma Official', followersCount: 45800,  status: 'connected', accountType: 'business' },
  { id: 'a4', platform: 'youtube',   username: 'Priya Creates',       displayName: 'Priya Creates',         followersCount: 89200,  status: 'connected', accountType: 'creator'  },
  { id: 'a5', platform: 'linkedin',  username: 'in/priyasharma',      displayName: 'Priya Sharma',          followersCount: 5600,   status: 'expired',   accountType: 'personal' },
  { id: 'a6', platform: 'threads',   username: '@priya.creates',      displayName: 'Priya Creates',         followersCount: 9800,   status: 'connected', accountType: 'personal' },
];

export const MOCK_POSTS: Post[] = [
  {
    id: 'p1', status: 'published', createdAt: '2024-05-01T09:00:00Z', publishedAt: '2024-05-01T09:00:00Z',
    text: '🌸 Morning ritu that changed my life! Starting your day with intention makes everything better.',
    hashtags: ['morningroutine','lifestyle','selfcare','motivation'],
    media: [{ id: 'm1', url: 'https://picsum.photos/seed/morning/400/300', thumbUrl: 'https://picsum.photos/seed/morning/200/150', type: 'image', filename: 'morning.jpg', size: 2400000, width: 400, height: 300, uploadedAt: '2024-05-01T08:00:00Z' }],
    targets: [
      { id: 't1', platform: 'instagram', accountId: 'a1', status: 'success', likes: 3240, comments: 187, reach: 45600 },
      { id: 't2', platform: 'twitter',   accountId: 'a2', status: 'success', likes: 892,  comments: 43,  reach: 12400 },
      { id: 't3', platform: 'facebook',  accountId: 'a3', status: 'success', likes: 1460, comments: 73,  reach: 28900 },
    ],
  },
  {
    id: 'p2', status: 'published', createdAt: '2024-04-30T12:00:00Z', publishedAt: '2024-04-30T12:00:00Z',
    text: '✨ 5 summer outfit ideas — from casual to formal! Which style is your favourite?',
    hashtags: ['ootd','fashion','summerstyle','indianfashion'],
    media: [{ id: 'm2', url: 'https://picsum.photos/seed/fashion/400/300', thumbUrl: 'https://picsum.photos/seed/fashion/200/150', type: 'image', filename: 'fashion.jpg', size: 1800000, width: 400, height: 300, uploadedAt: '2024-04-30T11:00:00Z' }],
    targets: [
      { id: 't4', platform: 'instagram', accountId: 'a1', status: 'success', likes: 4820, comments: 211, reach: 67300 },
      { id: 't5', platform: 'youtube',   accountId: 'a4', status: 'success', likes: 5600, comments: 340, reach: 124000 },
    ],
  },
  {
    id: 'p3', status: 'scheduled', createdAt: '2024-05-02T10:00:00Z', scheduledAt: '2024-05-04T10:00:00Z',
    text: '🎉 Big announcement coming this Saturday at 10 AM! You will not want to miss this.',
    hashtags: ['announcement','exciting','staytuned'],
    media: [],
    targets: [
      { id: 't6', platform: 'instagram', accountId: 'a1', status: 'pending' },
      { id: 't7', platform: 'twitter',   accountId: 'a2', status: 'pending' },
      { id: 't8', platform: 'threads',   accountId: 'a6', status: 'pending' },
    ],
  },
];

export const MOCK_ANALYTICS: AnalyticsSummary = {
  totalPosts: 28, totalReach: 1248600, totalImpressions: 2840000,
  totalEngagement: 89400, avgEngagementRate: 7.16,
  platforms: [
    { platform: 'instagram', impressions: 980000, reach: 540000, likes: 42000, comments: 3200, shares: 8400, engagementRate: 8.2, followersGrowth: 3200 },
    { platform: 'youtube',   impressions: 620000, reach: 380000, likes: 18200, comments: 1840, shares: 0,    engagementRate: 5.1, followersGrowth: 1800 },
    { platform: 'twitter',   impressions: 480000, reach: 180000, likes: 9400,  comments: 840,  shares: 4200, engagementRate: 6.3, followersGrowth: 420  },
    { platform: 'facebook',  impressions: 420000, reach: 148600, likes: 12800, comments: 920,  shares: 3200, engagementRate: 5.9, followersGrowth: 280  },
    { platform: 'linkedin',  impressions: 148000, reach: 62000,  likes: 4200,  comments: 380,  shares: 1200, engagementRate: 9.2, followersGrowth: 340  },
    { platform: 'threads',   impressions: 192000, reach: 82000,  likes: 2800,  comments: 220,  shares: 800,  engagementRate: 4.7, followersGrowth: 960  },
  ],
};

export const MOCK_HASHTAG_SETS: HashtagSet[] = [
  { id: 'hs1', name: 'Lifestyle',   tags: ['lifestyle','selfcare','wellness','motivation','mindset'],          useCount: 24 },
  { id: 'hs2', name: 'Fashion',     tags: ['ootd','fashion','style','indianfashion','outfitoftheday'],          useCount: 18 },
  { id: 'hs3', name: 'India Creator',tags: ['indianinfluencer','indiacreator','contentcreator','bloggersofindia'], useCount: 31 },
];

export const MOCK_MEDIA: MediaAsset[] = [
  { id: 'm3', url: 'https://picsum.photos/seed/med1/400/300', thumbUrl: 'https://picsum.photos/seed/med1/200/150', type: 'image', filename: 'photo-01.jpg', size: 1800000, width: 800, height: 600, uploadedAt: '2024-05-01T10:00:00Z' },
  { id: 'm4', url: 'https://picsum.photos/seed/med2/400/300', thumbUrl: 'https://picsum.photos/seed/med2/200/150', type: 'image', filename: 'photo-02.jpg', size: 2100000, width: 800, height: 600, uploadedAt: '2024-04-29T11:00:00Z' },
  { id: 'm5', url: 'https://picsum.photos/seed/med3/400/300', thumbUrl: 'https://picsum.photos/seed/med3/200/150', type: 'image', filename: 'photo-03.jpg', size: 1600000, width: 800, height: 600, uploadedAt: '2024-04-28T09:00:00Z' },
  { id: 'm6', url: 'https://picsum.photos/seed/med4/400/300', thumbUrl: 'https://picsum.photos/seed/med4/200/150', type: 'video', filename: 'reel-01.mp4',  size: 48000000, width: 1080, height: 1920, duration: 30, uploadedAt: '2024-04-27T14:00:00Z' },
  { id: 'm7', url: 'https://picsum.photos/seed/med5/400/300', thumbUrl: 'https://picsum.photos/seed/med5/200/150', type: 'image', filename: 'photo-04.jpg', size: 2800000, width: 1080, height: 1080, uploadedAt: '2024-04-26T12:00:00Z' },
  { id: 'm8', url: 'https://picsum.photos/seed/med6/400/300', thumbUrl: 'https://picsum.photos/seed/med6/200/150', type: 'video', filename: 'vlog-01.mp4',  size: 120000000,width: 1920, height: 1080, duration: 180, uploadedAt: '2024-04-24T10:00:00Z' },
];

export const MOCK_NOTIFICATIONS: Notification[] = [
  { id: 'n1', type: 'post_success',      title: 'Post Published! 🎉',      message: 'Your morning routine post went live on Instagram, Twitter & Facebook.',  isRead: false, createdAt: '2024-05-01T09:01:00Z' },
  { id: 'n2', type: 'token_expired',     title: 'LinkedIn token expired',   message: 'Reconnect your LinkedIn account to continue posting.',                    isRead: false, createdAt: '2024-05-01T08:00:00Z' },
  { id: 'n3', type: 'scheduled_reminder',title: 'Scheduled post in 15 min', message: 'Your announcement post goes live at 10:00 AM on 3 platforms.',            isRead: true,  createdAt: '2024-05-04T09:45:00Z' },
];

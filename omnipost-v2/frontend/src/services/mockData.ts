/* ================================================================
   Mock data — replace with real API calls in production
   ================================================================ */
import type {
  User, SocialAccount, Post, AnalyticsSummary,
  AppNotification, HashtagSet, MediaAsset
} from '@/types';

export const MOCK_USER: User = {
  id: 'usr_01',
  name: 'Priya Sharma',
  email: 'priya@example.com',
  mobile: '+919876543210',
  avatar: 'https://api.dicebear.com/8.x/avataaars/svg?seed=Priya',
  bio: 'Content creator & lifestyle influencer 🌸',
  plan: 'creator',
  language: 'en',
  createdAt: '2024-01-15T10:30:00Z',
  isVerified: true,
};

export const MOCK_ACCOUNTS: SocialAccount[] = [
  {
    id: 'acc_01', userId: 'usr_01', platform: 'instagram',
    platformUserId: 'ig_123', username: '@priya.creates',
    displayName: 'Priya Creates', status: 'connected',
    connectedAt: '2024-01-16T10:00:00Z', followersCount: 124500,
    accountType: 'creator',
  },
  {
    id: 'acc_02', userId: 'usr_01', platform: 'twitter',
    platformUserId: 'tw_456', username: '@priyasharma',
    displayName: 'Priya Sharma', status: 'connected',
    connectedAt: '2024-01-16T10:05:00Z', followersCount: 18200,
    accountType: 'personal',
  },
  {
    id: 'acc_03', userId: 'usr_01', platform: 'facebook',
    platformUserId: 'fb_789', username: 'priya.sharma.page',
    displayName: 'Priya Sharma Official', status: 'connected',
    connectedAt: '2024-01-16T10:10:00Z', followersCount: 45800,
    accountType: 'business',
  },
  {
    id: 'acc_04', userId: 'usr_01', platform: 'youtube',
    platformUserId: 'yt_111', username: 'PriyaCreates',
    displayName: 'Priya Creates', status: 'connected',
    connectedAt: '2024-01-20T09:00:00Z', followersCount: 89200,
    accountType: 'creator',
  },
  {
    id: 'acc_05', userId: 'usr_01', platform: 'linkedin',
    platformUserId: 'li_222', username: 'in/priyasharma',
    displayName: 'Priya Sharma', status: 'expired',
    connectedAt: '2024-02-01T08:00:00Z', followersCount: 5600,
    tokenExpiresAt: '2024-05-01T00:00:00Z',
    accountType: 'personal',
  },
  {
    id: 'acc_06', userId: 'usr_01', platform: 'threads',
    platformUserId: 'th_333', username: '@priya.creates',
    displayName: 'Priya Creates', status: 'connected',
    connectedAt: '2024-03-01T10:00:00Z', followersCount: 9800,
    accountType: 'personal',
  },
];

export const MOCK_POSTS: Post[] = [
  {
    id: 'post_01', userId: 'usr_01',
    text: '🌸 Morning ritu that changed my life! Starting your day with intention makes everything better. What\'s your morning routine?',
    hashtags: ['#morningroutine', '#lifestyle', '#selfcare', '#motivation', '#indiainfluencer'],
    media: [{
      id: 'med_01', userId: 'usr_01', type: 'image',
      url: 'https://picsum.photos/seed/morning/800/600',
      thumbUrl: 'https://picsum.photos/seed/morning/400/300',
      filename: 'morning-routine.jpg', size: 2_400_000,
      width: 800, height: 600, uploadedAt: '2024-05-01T07:00:00Z',
    }],
    targets: [
      { id: 't_01', socialAccountId: 'acc_01', platform: 'instagram', status: 'success', postUrl: '#', likes: 3240, comments: 187, shares: 92, reach: 45600, publishedAt: '2024-05-01T09:00:00Z' },
      { id: 't_02', socialAccountId: 'acc_02', platform: 'twitter',   status: 'success', postUrl: '#', likes: 892,  comments: 43,  shares: 215, reach: 12400, publishedAt: '2024-05-01T09:00:00Z' },
      { id: 't_03', socialAccountId: 'acc_03', platform: 'facebook',  status: 'success', postUrl: '#', likes: 1460, comments: 73,  shares: 180, reach: 28900, publishedAt: '2024-05-01T09:00:00Z' },
    ],
    status: 'published', publishedAt: '2024-05-01T09:00:00Z',
    createdAt: '2024-05-01T08:45:00Z', updatedAt: '2024-05-01T09:01:00Z',
  },
  {
    id: 'post_02', userId: 'usr_01',
    text: '✨ New video out now! 5 outfit ideas for summer 2025 — from casual to formal. Which style is your fav?',
    hashtags: ['#ootd', '#fashion', '#summerstyle', '#indianfashion', '#styletips'],
    media: [{
      id: 'med_02', userId: 'usr_01', type: 'video',
      url: 'https://picsum.photos/seed/fashion/800/450',
      thumbUrl: 'https://picsum.photos/seed/fashion/400/225',
      filename: 'summer-outfits.mp4', size: 45_000_000,
      width: 1920, height: 1080, duration: 180,
      uploadedAt: '2024-04-28T14:00:00Z',
    }],
    targets: [
      { id: 't_04', socialAccountId: 'acc_04', platform: 'youtube',   status: 'success', postUrl: '#', likes: 5600, comments: 340, shares: 0, reach: 124000, publishedAt: '2024-04-30T12:00:00Z' },
      { id: 't_05', socialAccountId: 'acc_01', platform: 'instagram', status: 'success', postUrl: '#', likes: 4820, comments: 211, shares: 0, reach: 67300, publishedAt: '2024-04-30T12:00:00Z' },
    ],
    status: 'published', publishedAt: '2024-04-30T12:00:00Z',
    createdAt: '2024-04-28T14:00:00Z', updatedAt: '2024-04-30T12:01:00Z',
  },
  {
    id: 'post_03', userId: 'usr_01',
    text: '🎉 Exciting news coming soon! Stay tuned for a big announcement this weekend...',
    hashtags: ['#announcement', '#exciting', '#staytuned'],
    media: [],
    targets: [
      { id: 't_06', socialAccountId: 'acc_01', platform: 'instagram', status: 'pending' },
      { id: 't_07', socialAccountId: 'acc_02', platform: 'twitter',   status: 'pending' },
      { id: 't_08', socialAccountId: 'acc_06', platform: 'threads',   status: 'pending' },
    ],
    status: 'scheduled', scheduledAt: '2024-05-04T10:00:00Z',
    createdAt: '2024-05-02T11:00:00Z', updatedAt: '2024-05-02T11:00:00Z',
  },
];

export const MOCK_ANALYTICS: AnalyticsSummary = {
  dateRange: { from: '2024-04-01', to: '2024-04-30' },
  totalPosts: 28,
  totalReach: 1_248_600,
  totalImpressions: 2_840_000,
  totalEngagement: 89_400,
  avgEngagementRate: 7.16,
  platforms: [
    { platform: 'instagram', impressions: 980000, reach: 540000, likes: 42000, comments: 3200, shares: 8400, saves: 12400, engagementRate: 8.2, followersGrowth: 3200 },
    { platform: 'youtube',   impressions: 620000, reach: 380000, likes: 18200, comments: 1840, shares: 0,    engagementRate: 5.1, followersGrowth: 1800 },
    { platform: 'twitter',   impressions: 480000, reach: 180000, likes: 9400,  comments: 840,  shares: 4200, engagementRate: 6.3, followersGrowth: 420 },
    { platform: 'facebook',  impressions: 420000, reach: 148600, likes: 12800, comments: 920,  shares: 3200, engagementRate: 5.9, followersGrowth: 280 },
    { platform: 'linkedin',  impressions: 148000, reach: 62000,  likes: 4200,  comments: 380,  shares: 1200, engagementRate: 9.2, followersGrowth: 340 },
    { platform: 'threads',   impressions: 192000, reach: 82000,  likes: 2800,  comments: 220,  shares: 800,  engagementRate: 4.7, followersGrowth: 960 },
  ],
  dailyData: Array.from({ length: 30 }, (_, i) => ({
    date: `2024-04-${String(i + 1).padStart(2, '0')}`,
    posts: Math.floor(Math.random() * 3),
    impressions: 60000 + Math.floor(Math.random() * 80000),
    reach: 30000 + Math.floor(Math.random() * 40000),
    engagement: 2000 + Math.floor(Math.random() * 4000),
  })),
  topHashtags: [
    { tag: '#indianinfluencer', count: 12, reach: 180000 },
    { tag: '#lifestyle',        count: 18, reach: 156000 },
    { tag: '#morningroutine',   count: 8,  reach: 124000 },
    { tag: '#ootd',             count: 14, reach: 112000 },
    { tag: '#selfcare',         count: 10, reach: 98000  },
  ],
  bestPostTime: [
    { platform: 'instagram', hour: 9,  day: 'Wednesday' },
    { platform: 'facebook',  hour: 13, day: 'Thursday'  },
    { platform: 'twitter',   hour: 12, day: 'Tuesday'   },
    { platform: 'linkedin',  hour: 10, day: 'Tuesday'   },
  ],
};

export const MOCK_NOTIFICATIONS: AppNotification[] = [
  {
    id: 'n_01', userId: 'usr_01', type: 'post_success',
    title: 'Post Published!',
    message: 'Your morning routine post went live on Instagram, Twitter & Facebook.',
    isRead: false, createdAt: '2024-05-01T09:01:00Z',
  },
  {
    id: 'n_02', userId: 'usr_01', type: 'token_expired',
    title: 'LinkedIn token expired',
    message: 'Reconnect your LinkedIn account to continue posting.',
    isRead: false, createdAt: '2024-05-01T08:00:00Z', actionUrl: '/settings/accounts',
  },
  {
    id: 'n_03', userId: 'usr_01', type: 'scheduled_reminder',
    title: 'Scheduled post in 15 min',
    message: 'Your announcement post will go live at 10:00 AM on 3 platforms.',
    isRead: true, createdAt: '2024-05-04T09:45:00Z',
  },
];

export const MOCK_HASHTAG_SETS: HashtagSet[] = [
  {
    id: 'hs_01', userId: 'usr_01', name: 'Lifestyle',
    tags: ['#lifestyle', '#selfcare', '#wellness', '#motivation', '#mindset', '#positivity'],
    useCount: 24, createdAt: '2024-02-01T10:00:00Z',
  },
  {
    id: 'hs_02', userId: 'usr_01', name: 'Fashion',
    tags: ['#ootd', '#fashion', '#style', '#indianfashion', '#outfitoftheday', '#wiwt'],
    useCount: 18, createdAt: '2024-02-10T10:00:00Z',
  },
  {
    id: 'hs_03', userId: 'usr_01', name: 'India Creator',
    tags: ['#indianinfluencer', '#indiacreator', '#contentcreator', '#bloggersofindia', '#instagramindia'],
    useCount: 31, createdAt: '2024-01-20T10:00:00Z',
  },
];

export const MOCK_MEDIA: MediaAsset[] = [
  { id: 'med_03', userId: 'usr_01', type: 'image', url: 'https://picsum.photos/seed/a1/800/600',  thumbUrl: 'https://picsum.photos/seed/a1/400/300',  filename: 'photo-01.jpg', size: 1_800_000, width: 800, height: 600, uploadedAt: '2024-05-01T10:00:00Z' },
  { id: 'med_04', userId: 'usr_01', type: 'image', url: 'https://picsum.photos/seed/a2/800/600',  thumbUrl: 'https://picsum.photos/seed/a2/400/300',  filename: 'photo-02.jpg', size: 2_100_000, width: 800, height: 600, uploadedAt: '2024-04-29T11:00:00Z' },
  { id: 'med_05', userId: 'usr_01', type: 'image', url: 'https://picsum.photos/seed/a3/800/600',  thumbUrl: 'https://picsum.photos/seed/a3/400/300',  filename: 'photo-03.jpg', size: 1_600_000, width: 800, height: 600, uploadedAt: '2024-04-28T09:00:00Z' },
  { id: 'med_06', userId: 'usr_01', type: 'image', url: 'https://picsum.photos/seed/a4/1080/1080',thumbUrl: 'https://picsum.photos/seed/a4/400/400',  filename: 'photo-04.jpg', size: 3_200_000, width: 1080, height: 1080, uploadedAt: '2024-04-26T14:00:00Z' },
  { id: 'med_07', userId: 'usr_01', type: 'image', url: 'https://picsum.photos/seed/a5/1080/1080',thumbUrl: 'https://picsum.photos/seed/a5/400/400',  filename: 'photo-05.jpg', size: 2_800_000, width: 1080, height: 1080, uploadedAt: '2024-04-24T10:00:00Z' },
  { id: 'med_08', userId: 'usr_01', type: 'video', url: 'https://picsum.photos/seed/v1/800/450',  thumbUrl: 'https://picsum.photos/seed/v1/400/225',  filename: 'video-01.mp4', size: 48_000_000, width: 1920, height: 1080, duration: 120, uploadedAt: '2024-04-22T12:00:00Z' },
];

/**
 * OmniPost Social Publisher Service
 * Handles publishing to all social media platforms via their respective APIs.
 * Replace TODO sections with real API calls using credentials from .env
 */
import axios from 'axios';
import { logger } from '../config/logger';

export type PublishResult = {
  platform:        string;
  status:          'success' | 'failed';
  platformPostId?: string;
  postUrl?:        string;
  errorMessage?:   string;
};

export type PostPayload = {
  text:     string;
  hashtags: string[];
  mediaUrls: string[];
  platform: string;
  accessToken: string;
  platformUserId: string;
  // Platform-specific
  youtubeTitle?:       string;
  youtubeDescription?: string;
  youtubeTags?:        string[];
  youtubeCategory?:    string;
  youtubePrivacy?:     'public' | 'unlisted' | 'private';
  instagramMediaType?: 'IMAGE' | 'VIDEO' | 'REELS' | 'CAROUSEL_ALBUM';
  linkedinVisibility?: 'PUBLIC' | 'CONNECTIONS';
};

/* ─── Meta (Instagram + Facebook) ──────────────────────────── */
async function publishToInstagram(payload: PostPayload): Promise<PublishResult> {
  try {
    const caption = [payload.text, ...payload.hashtags.map(h => `#${h}`)].join('\n\n');
    const BASE = 'https://graph.facebook.com/v19.0';

    // 1. Create media container
    const containerRes = await axios.post(
      `${BASE}/${payload.platformUserId}/media`,
      {
        image_url: payload.mediaUrls[0],
        caption,
        media_type: payload.instagramMediaType || 'IMAGE',
        access_token: payload.accessToken,
      }
    );
    const containerId = containerRes.data.id;

    // 2. Publish container
    const publishRes = await axios.post(
      `${BASE}/${payload.platformUserId}/media_publish`,
      { creation_id: containerId, access_token: payload.accessToken }
    );

    return {
      platform: 'instagram', status: 'success',
      platformPostId: publishRes.data.id,
      postUrl: `https://www.instagram.com/p/${publishRes.data.id}`,
    };
  } catch (err: any) {
    logger.error('Instagram publish failed:', err.response?.data || err.message);
    return { platform: 'instagram', status: 'failed', errorMessage: err.response?.data?.error?.message || err.message };
  }
}

async function publishToFacebook(payload: PostPayload): Promise<PublishResult> {
  try {
    const message = [payload.text, ...payload.hashtags.map(h => `#${h}`)].join('\n\n');
    const BASE = 'https://graph.facebook.com/v19.0';

    const body: Record<string, string> = { message, access_token: payload.accessToken };
    if (payload.mediaUrls[0]) body.link = payload.mediaUrls[0];

    const res = await axios.post(`${BASE}/${payload.platformUserId}/feed`, body);

    return {
      platform: 'facebook', status: 'success',
      platformPostId: res.data.id,
      postUrl: `https://www.facebook.com/${res.data.id}`,
    };
  } catch (err: any) {
    logger.error('Facebook publish failed:', err.response?.data || err.message);
    return { platform: 'facebook', status: 'failed', errorMessage: err.response?.data?.error?.message || err.message };
  }
}

/* ─── Twitter / X ───────────────────────────────────────────── */
async function publishToTwitter(payload: PostPayload): Promise<PublishResult> {
  try {
    const text = payload.text.slice(0, 280);
    // Upload media first if present
    let mediaIds: string[] = [];
    // TODO: Upload media to https://upload.twitter.com/1.1/media/upload.json
    // mediaIds = await uploadMediaToTwitter(payload.mediaUrls, payload.accessToken);

    const res = await axios.post(
      'https://api.twitter.com/2/tweets',
      {
        text: `${text}${payload.hashtags.length ? ' ' + payload.hashtags.map(h => `#${h}`).join(' ') : ''}`,
        ...(mediaIds.length && { media: { media_ids: mediaIds } }),
      },
      { headers: { Authorization: `Bearer ${payload.accessToken}`, 'Content-Type': 'application/json' } }
    );

    return {
      platform: 'twitter', status: 'success',
      platformPostId: res.data.data.id,
      postUrl: `https://twitter.com/i/web/status/${res.data.data.id}`,
    };
  } catch (err: any) {
    logger.error('Twitter publish failed:', err.response?.data || err.message);
    return { platform: 'twitter', status: 'failed', errorMessage: err.response?.data?.detail || err.message };
  }
}

/* ─── YouTube ───────────────────────────────────────────────── */
async function publishToYouTube(payload: PostPayload): Promise<PublishResult> {
  try {
    // TODO: Use YouTube Data API v3 videos.insert with resumable upload
    // Requires multipart upload for video file
    const res = await axios.post(
      'https://www.googleapis.com/youtube/v3/videos?part=snippet,status',
      {
        snippet: {
          title:       payload.youtubeTitle || payload.text.slice(0, 100),
          description: payload.youtubeDescription || payload.text,
          tags:        [...(payload.youtubeTags || []), ...payload.hashtags],
          categoryId:  payload.youtubeCategory || '22', // 22 = People & Blogs
        },
        status: { privacyStatus: payload.youtubePrivacy || 'public' },
      },
      { headers: { Authorization: `Bearer ${payload.accessToken}` } }
    );

    return {
      platform: 'youtube', status: 'success',
      platformPostId: res.data.id,
      postUrl: `https://www.youtube.com/watch?v=${res.data.id}`,
    };
  } catch (err: any) {
    logger.error('YouTube publish failed:', err.response?.data || err.message);
    return { platform: 'youtube', status: 'failed', errorMessage: err.response?.data?.error?.message || err.message };
  }
}

/* ─── LinkedIn ──────────────────────────────────────────────── */
async function publishToLinkedIn(payload: PostPayload): Promise<PublishResult> {
  try {
    const text = [payload.text, ...payload.hashtags.map(h => `#${h}`)].join('\n\n');
    const res = await axios.post(
      'https://api.linkedin.com/v2/ugcPosts',
      {
        author: `urn:li:person:${payload.platformUserId}`,
        lifecycleState: 'PUBLISHED',
        specificContent: {
          'com.linkedin.ugc.ShareContent': {
            shareCommentary: { text },
            shareMediaCategory: payload.mediaUrls.length ? 'IMAGE' : 'NONE',
            ...(payload.mediaUrls.length && {
              media: [{ status: 'READY', originalUrl: payload.mediaUrls[0] }],
            }),
          },
        },
        visibility: { 'com.linkedin.ugc.MemberNetworkVisibility': payload.linkedinVisibility || 'PUBLIC' },
      },
      { headers: { Authorization: `Bearer ${payload.accessToken}`, 'Content-Type': 'application/json', 'X-Restli-Protocol-Version': '2.0.0' } }
    );

    return {
      platform: 'linkedin', status: 'success',
      platformPostId: res.data.id,
      postUrl: `https://www.linkedin.com/feed/update/${res.data.id}`,
    };
  } catch (err: any) {
    logger.error('LinkedIn publish failed:', err.response?.data || err.message);
    return { platform: 'linkedin', status: 'failed', errorMessage: err.response?.data?.message || err.message };
  }
}

/* ─── Threads ───────────────────────────────────────────────── */
async function publishToThreads(payload: PostPayload): Promise<PublishResult> {
  try {
    const text = [payload.text, ...payload.hashtags.map(h => `#${h}`)].join('\n\n');
    const BASE = 'https://graph.threads.net/v1.0';

    // 1. Create container
    const containerRes = await axios.post(`${BASE}/${payload.platformUserId}/threads`, {
      media_type: payload.mediaUrls.length ? 'IMAGE' : 'TEXT',
      text,
      ...(payload.mediaUrls[0] && { image_url: payload.mediaUrls[0] }),
      access_token: payload.accessToken,
    });

    // 2. Publish
    const publishRes = await axios.post(`${BASE}/${payload.platformUserId}/threads_publish`, {
      creation_id: containerRes.data.id,
      access_token: payload.accessToken,
    });

    return { platform: 'threads', status: 'success', platformPostId: publishRes.data.id };
  } catch (err: any) {
    logger.error('Threads publish failed:', err.response?.data || err.message);
    return { platform: 'threads', status: 'failed', errorMessage: err.message };
  }
}

/* ─── ShareChat ─────────────────────────────────────────────── */
async function publishToShareChat(payload: PostPayload): Promise<PublishResult> {
  try {
    // TODO: Implement ShareChat Creator API
    // API docs: https://developer.sharechat.com
    const res = await axios.post('https://api.sharechat.com/v1/posts', {
      text: payload.text,
      hashtags: payload.hashtags,
      mediaUrl: payload.mediaUrls[0],
    }, { headers: { 'X-API-Key': process.env.SHARECHAT_API_KEY, Authorization: `Bearer ${payload.accessToken}` } });
    return { platform: 'sharechat', status: 'success', platformPostId: res.data.postId };
  } catch (err: any) {
    return { platform: 'sharechat', status: 'failed', errorMessage: err.message };
  }
}

/* ─── Master publisher ──────────────────────────────────────── */
const PUBLISHERS: Record<string, (p: PostPayload) => Promise<PublishResult>> = {
  instagram: publishToInstagram,
  facebook:  publishToFacebook,
  twitter:   publishToTwitter,
  youtube:   publishToYouTube,
  linkedin:  publishToLinkedIn,
  threads:   publishToThreads,
  sharechat: publishToShareChat,
};

export async function publishToAllPlatforms(
  payloads: PostPayload[]
): Promise<PublishResult[]> {
  // Fire all platform requests concurrently
  const results = await Promise.allSettled(
    payloads.map(p => {
      const publisher = PUBLISHERS[p.platform];
      if (!publisher) return Promise.resolve({ platform: p.platform, status: 'failed' as const, errorMessage: 'Platform not supported' });
      return publisher(p);
    })
  );

  return results.map((r, i) => {
    if (r.status === 'fulfilled') return r.value;
    logger.error(`Publisher crashed for ${payloads[i].platform}:`, r.reason);
    return { platform: payloads[i].platform, status: 'failed', errorMessage: String(r.reason) };
  });
}

// src/workers/publishWorker.ts
// Run this process separately: `ts-node src/workers/publishWorker.ts`
// Or import and call startWorkers() from server.ts
import 'dotenv/config';
import { publishQueue, analyticsQueue, tokenRefreshQueue } from '../config/queue';
import { publishToAllPlatforms, PostPayload } from '../services/social/publisher';
import { logger } from '../config/logger';
import { decrypt } from '../utils/encryption';

// ── Publish Worker ─────────────────────────────────────────────
publishQueue.process(5, async (job) => {
  const { postId, userId, text, hashtags, mediaUrls, targets } = job.data;
  logger.info(`Processing publish job ${job.id} for post ${postId}`);

  try {
    // Build payloads — in production fetch real tokens from DB
    // const accountRows = await db.query(
    //   'SELECT sa.platform, sa.platform_user_id, sa.access_token_enc FROM social_accounts sa
    //    JOIN post_targets pt ON pt.social_account_id = sa.id
    //    WHERE pt.post_id = $1', [postId]
    // );

    const payloads: PostPayload[] = targets.map((t: any) => ({
      platform:        t.platform,
      platformUserId:  t.platformUserId,
      accessToken:     t.accessTokenEnc ? decrypt(t.accessTokenEnc) : t.accessToken,
      text:            t.customText  ?? text,
      hashtags:        t.customHashtags ?? hashtags,
      mediaUrls:       mediaUrls ?? [],
      // YouTube specific
      youtubeTitle:    t.youtubeTitle,
      youtubePrivacy:  t.youtubePrivacy ?? 'public',
      // Instagram specific
      instagramMediaType: t.instagramMediaType ?? 'IMAGE',
      // LinkedIn
      linkedinVisibility: t.linkedinVisibility ?? 'PUBLIC',
    }));

    const results = await publishToAllPlatforms(payloads);

    // Update post_targets status in DB
    // for (const result of results) {
    //   await db.query(
    //     `UPDATE post_targets SET status=$1, platform_post_id=$2, post_url=$3, error_message=$4, published_at=NOW()
    //      WHERE post_id=$5 AND platform=$6`,
    //     [result.status, result.platformPostId, result.postUrl, result.errorMessage, postId, result.platform]
    //   );
    // }

    const allOk    = results.every(r => r.status === 'success');
    const anyOk    = results.some(r  => r.status === 'success');
    const finalStatus = allOk ? 'published' : anyOk ? 'partial' : 'failed';

    // await db.query('UPDATE posts SET status=$1, published_at=NOW() WHERE id=$2', [finalStatus, postId]);

    // Queue analytics fetch for 30 min later
    await analyticsQueue.add({ postId, userId }, { delay: 30 * 60 * 1000 });

    // TODO: Send push notification via FCM
    logger.info(`Post ${postId} published with status: ${finalStatus}`);
    return { postId, status: finalStatus, results };

  } catch (err) {
    logger.error(`Publish job ${job.id} failed:`, err);
    // await db.query('UPDATE posts SET status=$1 WHERE id=$2', ['failed', postId]);
    throw err; // Bull will retry per backoff config
  }
});

// ── Analytics Worker ───────────────────────────────────────────
analyticsQueue.process(3, async (job) => {
  const { postId, userId } = job.data;
  logger.info(`Fetching analytics for post ${postId}`);

  // TODO: For each post_target, fetch metrics from platform API
  // Instagram: GET /{media-id}/insights?metric=impressions,reach,likes,comments,saves
  // Twitter:   GET /tweets/:id - public_metrics
  // YouTube:   GET /videos?part=statistics&id={videoId}
  // LinkedIn:  GET /socialActions/{shareUrn}
  // Facebook:  GET /{post-id}/insights

  // Then: INSERT INTO post_analytics (target_id, impressions, reach, likes, ...)
  return { postId, fetched: true };
});

// ── Token Refresh Worker ───────────────────────────────────────
tokenRefreshQueue.process(2, async (job) => {
  const { accountId, platform } = job.data;
  logger.info(`Refreshing token for account ${accountId} on ${platform}`);

  // TODO: Use refresh_token to get new access_token
  // Platform-specific refresh flows:
  // Meta: POST /oauth/access_token with grant_type=fb_exchange_token
  // LinkedIn: POST /oauth/v2/accessToken with grant_type=refresh_token
  // Google: POST /oauth2/v4/token with grant_type=refresh_token

  // await db.query(
  //   'UPDATE social_accounts SET access_token_enc=$1, token_expires_at=$2, status=$3 WHERE id=$4',
  //   [encrypt(newToken), newExpiry, 'connected', accountId]
  // );
  return { accountId, refreshed: true };
});

logger.info('🔧 Workers started: publish, analytics, token-refresh');

export function startWorkers() {
  logger.info('Workers registered');
}

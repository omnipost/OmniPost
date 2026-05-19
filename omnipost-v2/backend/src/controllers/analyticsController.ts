// src/controllers/analyticsController.ts
import { Request, Response } from 'express';
import { logger } from '../config/logger';

function ok(res: Response, data: unknown) {
  return res.json({ success: true, data });
}
function fail(res: Response, status: number, error: string) {
  return res.status(status).json({ success: false, error });
}

/* ── GET /api/analytics/summary?from=&to= ───────────────────── */
export async function getAnalyticsSummary(req: Request, res: Response) {
  try {
    const userId = (req as any).userId;
    const { from, to } = req.query;

    // TODO: Aggregate from post_analytics + post_targets JOIN posts
    // SQL example:
    // SELECT
    //   SUM(pa.impressions) as total_impressions,
    //   SUM(pa.reach)       as total_reach,
    //   SUM(pa.likes + pa.comments + pa.shares) as total_engagement,
    //   COUNT(DISTINCT p.id) as total_posts
    // FROM post_analytics pa
    // JOIN post_targets pt ON pt.id = pa.target_id
    // JOIN posts p ON p.id = pt.post_id
    // WHERE p.user_id = $1
    //   AND p.published_at BETWEEN $2 AND $3

    // Return mock structure for now
    return ok(res, {
      dateRange:         { from, to },
      totalPosts:        28,
      totalReach:        1248600,
      totalImpressions:  2840000,
      totalEngagement:   89400,
      avgEngagementRate: 7.16,
      platforms: [],
      dailyData:  [],
      topHashtags:[],
    });
  } catch (err) {
    logger.error('getAnalyticsSummary error:', err);
    return fail(res, 500, 'Failed to fetch analytics');
  }
}

/* ── GET /api/analytics/posts/:postId ───────────────────────── */
export async function getPostAnalytics(req: Request, res: Response) {
  try {
    const { postId } = req.params;
    // TODO: SELECT pa.*, pt.platform FROM post_analytics pa
    //       JOIN post_targets pt ON pt.id = pa.target_id
    //       WHERE pt.post_id = $1
    return ok(res, { postId, platforms: [] });
  } catch (err) {
    return fail(res, 500, 'Failed to fetch post analytics');
  }
}

/* ── POST /api/analytics/fetch — trigger background fetch ───── */
export async function triggerAnalyticsFetch(req: Request, res: Response) {
  try {
    const userId = (req as any).userId;
    // TODO: Add job to analyticsQueue for each connected account
    // Each job fetches metrics from platform APIs and stores in post_analytics
    // await analyticsQueue.add({ userId }, { delay: 0 });
    logger.info(`Analytics fetch triggered for user ${userId}`);
    return ok(res, { queued: true });
  } catch (err) {
    return fail(res, 500, 'Failed to trigger analytics fetch');
  }
}

/* ── GET /api/analytics/export ──────────────────────────────── */
export async function exportAnalytics(req: Request, res: Response) {
  try {
    const userId = (req as any).userId;
    const { from, to } = req.query;

    // TODO: Query DB and build real CSV rows
    const csvRows = [
      'date,platform,impressions,reach,likes,comments,shares,engagement_rate',
      `2024-05-01,instagram,98000,54000,3240,187,92,8.2`,
      `2024-05-01,twitter,48000,12400,892,43,215,6.3`,
      `2024-05-01,facebook,42000,28900,1460,73,180,5.9`,
    ].join('\n');

    res.setHeader('Content-Type', 'text/csv');
    res.setHeader('Content-Disposition', `attachment; filename=omnipost-analytics-${Date.now()}.csv`);
    return res.send(csvRows);
  } catch (err) {
    return fail(res, 500, 'Failed to export analytics');
  }
}

import { Request, Response } from 'express';
import { v4 as uuidv4 } from 'uuid';
import { logger } from '../config/logger';
import { publishQueue } from '../config/queue';

function ok(res: Response, data: unknown, message?: string) {
  return res.json({ success: true, data, message });
}
function fail(res: Response, status: number, error: string) {
  return res.status(status).json({ success: false, error });
}

/* ────────────────────────────────────────────────────────────────
   POST /api/posts/publish
   Body: { text, hashtags, mediaIds, targets: [{socialAccountId}], scheduledAt? }
   ─────────────────────────────────────────────────────────────── */
export async function publishPost(req: Request, res: Response) {
  try {
    const userId = (req as any).userId;
    const { text, hashtags = [], mediaIds = [], targets = [], scheduledAt } = req.body;

    if (!text && mediaIds.length === 0)
      return fail(res, 400, 'Post must have text or media');

    if (!targets || targets.length === 0)
      return fail(res, 400, 'Select at least one target platform');

    const postId = uuidv4();

    // TODO: Persist post to DB
    // await db.query(`INSERT INTO posts (id, user_id, text, hashtags, status, scheduled_at)
    //   VALUES ($1, $2, $3, $4, $5, $6)`,
    //   [postId, userId, text, hashtags, scheduledAt ? 'scheduled' : 'publishing', scheduledAt]);

    // TODO: Persist targets
    // for (const t of targets) {
    //   await db.query(`INSERT INTO post_targets (id, post_id, social_account_id, platform, status)
    //     VALUES ($1, $2, $3, $4, 'pending')`,
    //     [uuidv4(), postId, t.socialAccountId, t.platform]);
    // }

    if (scheduledAt) {
      // Queue for later
      const delay = new Date(scheduledAt).getTime() - Date.now();
      // await publishQueue.add({ postId, userId, text, hashtags, mediaIds, targets }, { delay: Math.max(0, delay) });
      logger.info(`Post ${postId} scheduled for ${scheduledAt}`);
      return ok(res, { postId, status: 'scheduled' }, 'Post scheduled successfully');
    }

    // Publish immediately — add to queue
    // await publishQueue.add({ postId, userId, text, hashtags, mediaIds, targets }, { priority: 1 });
    logger.info(`Post ${postId} queued for immediate publishing to ${targets.length} platforms`);

    return ok(res, { postId, status: 'publishing' }, 'Post is being published');

  } catch (err) {
    logger.error('publishPost error:', err);
    return fail(res, 500, 'Failed to publish post');
  }
}

/* ── List posts ───────────────────────────────────────────── */
export async function listPosts(req: Request, res: Response) {
  try {
    const userId = (req as any).userId;
    const { status, page = 1, limit = 20 } = req.query;

    // TODO: Query from DB with filters
    // const result = await db.query(
    //   `SELECT p.*, array_agg(row_to_json(pt)) as targets
    //    FROM posts p LEFT JOIN post_targets pt ON pt.post_id = p.id
    //    WHERE p.user_id = $1 ${status ? 'AND p.status = $2' : ''}
    //    GROUP BY p.id ORDER BY p.created_at DESC LIMIT $${status ? 3 : 2} OFFSET $${status ? 4 : 3}`,
    //   status ? [userId, status, limit, (page-1)*limit] : [userId, limit, (page-1)*limit]
    // );

    return ok(res, { posts: [], pagination: { total: 0, page: Number(page), limit: Number(limit), hasMore: false } });
  } catch (err) {
    logger.error('listPosts error:', err);
    return fail(res, 500, 'Failed to fetch posts');
  }
}

/* ── Get single post ──────────────────────────────────────── */
export async function getPost(req: Request, res: Response) {
  try {
    const { id } = req.params;
    const userId = (req as any).userId;
    // TODO: Fetch from DB, verify ownership
    return ok(res, { id, status: 'published' });
  } catch (err) {
    return fail(res, 500, 'Failed to fetch post');
  }
}

/* ── Delete post ──────────────────────────────────────────── */
export async function deletePost(req: Request, res: Response) {
  try {
    const { id } = req.params;
    // TODO: Soft delete in DB, cancel queue job if scheduled
    logger.info(`Post ${id} deleted`);
    return ok(res, { deleted: true });
  } catch (err) {
    return fail(res, 500, 'Failed to delete post');
  }
}

/* ── Retry failed post ────────────────────────────────────── */
export async function retryPost(req: Request, res: Response) {
  try {
    const { id } = req.params;
    const { targetIds } = req.body; // specific targets to retry
    // TODO: Re-queue failed targets
    logger.info(`Retrying post ${id} for targets: ${targetIds}`);
    return ok(res, { postId: id, status: 'publishing' }, 'Retry initiated');
  } catch (err) {
    return fail(res, 500, 'Failed to retry post');
  }
}

/* ── Save draft ───────────────────────────────────────────── */
export async function saveDraft(req: Request, res: Response) {
  try {
    const userId = (req as any).userId;
    const draft = req.body;
    const draftId = uuidv4();
    // TODO: Save to DB with status='draft'
    logger.info(`Draft ${draftId} saved for user ${userId}`);
    return ok(res, { draftId }, 'Draft saved');
  } catch (err) {
    return fail(res, 500, 'Failed to save draft');
  }
}

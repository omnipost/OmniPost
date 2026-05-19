// src/controllers/mediaController.ts
import { Request, Response } from 'express';
import { v4 as uuidv4 } from 'uuid';
import { logger } from '../config/logger';

function ok(res: Response, data: unknown, message?: string) {
  return res.json({ success: true, data, message });
}
function fail(res: Response, status: number, error: string) {
  return res.status(status).json({ success: false, error });
}

/* ── GET /api/media ─────────────────────────────────────────── */
export async function listMedia(req: Request, res: Response) {
  try {
    const userId = (req as any).userId;
    const { type, page = 1, limit = 40 } = req.query;

    // TODO: SELECT * FROM media_assets WHERE user_id=$1
    //       AND ($2::text IS NULL OR type=$2)
    //       ORDER BY uploaded_at DESC LIMIT $3 OFFSET $4
    return ok(res, {
      assets: [],
      pagination: { total: 0, page: Number(page), limit: Number(limit), hasMore: false },
    });
  } catch (err) {
    return fail(res, 500, 'Failed to list media');
  }
}

/* ── POST /api/media/upload ─────────────────────────────────── */
export async function uploadMedia(req: Request, res: Response) {
  try {
    const userId = (req as any).userId;
    const files  = (req.files as Express.Multer.File[]) ?? [];

    if (!files.length) return fail(res, 400, 'No files provided');

    const uploaded = await Promise.all(files.map(async (file) => {
      const assetId = uuidv4();
      const ext     = file.originalname.split('.').pop() ?? '';
      const s3Key   = `media/${userId}/${assetId}.${ext}`;

      // TODO: Upload to S3
      // const s3Url = await uploadToS3(file.buffer, s3Key, file.mimetype);
      // TODO: If image, use Sharp to generate thumbnail + optimize
      // const thumb = await sharp(file.buffer).resize(400, 300, { fit: 'cover' }).toBuffer();
      // TODO: If video, use FFmpeg to extract thumbnail frame
      // TODO: INSERT INTO media_assets (id, user_id, url, thumb_url, type, filename, size, s3_key)

      const mediaType = file.mimetype.startsWith('video/') ? 'video'
                      : file.mimetype.startsWith('audio/') ? 'audio'
                      : 'image';

      return {
        id:         assetId,
        userId,
        url:        `https://cdn.omnipost.in/${s3Key}`,
        thumbUrl:   `https://cdn.omnipost.in/thumbs/${assetId}.jpg`,
        type:       mediaType,
        filename:   file.originalname,
        size:       file.size,
        s3Key,
        uploadedAt: new Date().toISOString(),
      };
    }));

    logger.info(`User ${userId} uploaded ${uploaded.length} files`);
    return ok(res, uploaded, `${uploaded.length} file(s) uploaded`);
  } catch (err) {
    logger.error('uploadMedia error:', err);
    return fail(res, 500, 'Upload failed');
  }
}

/* ── DELETE /api/media/:id ──────────────────────────────────── */
export async function deleteMedia(req: Request, res: Response) {
  try {
    const userId   = (req as any).userId;
    const { id }   = req.params;

    // TODO: SELECT s3_key FROM media_assets WHERE id=$1 AND user_id=$2
    // TODO: Delete from S3: await s3.deleteObject({ Bucket, Key: s3Key }).promise()
    // TODO: DELETE FROM media_assets WHERE id=$1 AND user_id=$2
    logger.info(`Media ${id} deleted by user ${userId}`);
    return ok(res, { deleted: true });
  } catch (err) {
    return fail(res, 500, 'Delete failed');
  }
}

/* ── POST /api/media/bulk-delete ────────────────────────────── */
export async function bulkDeleteMedia(req: Request, res: Response) {
  try {
    const userId  = (req as any).userId;
    const { ids } = req.body as { ids: string[] };

    if (!Array.isArray(ids) || ids.length === 0) return fail(res, 400, 'ids array required');
    // TODO: Batch delete from S3 + DB
    return ok(res, { deleted: ids.length });
  } catch (err) {
    return fail(res, 500, 'Bulk delete failed');
  }
}

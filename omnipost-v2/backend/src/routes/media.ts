// ── routes/media.ts ─────────────────────────────────────────────
import { Router } from 'express';
import multer from 'multer';
import { requireAuth } from '../middleware/auth';
import { v4 as uuidv4 } from 'uuid';

const upload = multer({ storage: multer.memoryStorage(), limits: { fileSize: 500 * 1024 * 1024 } });
const router = Router();

router.get('/', requireAuth, (_req, res) => {
  res.json({ success: true, data: [] });
});

router.post('/upload', requireAuth, upload.array('files', 20), (req, res) => {
  const files = (req.files as Express.Multer.File[]) ?? [];
  // TODO: Upload to S3, run sharp for image resize/optimize
  const uploaded = files.map(f => ({
    id: uuidv4(), filename: f.originalname, size: f.size,
    type: f.mimetype.startsWith('video') ? 'video' : 'image',
    url: `https://cdn.omnipost.in/media/${uuidv4()}`,
    uploadedAt: new Date().toISOString(),
  }));
  res.json({ success: true, data: uploaded });
});

router.delete('/:id', requireAuth, (req, res) => {
  // TODO: Delete from S3 + DB
  res.json({ success: true, data: { deleted: true } });
});

export default router;

import { Router } from 'express';
import { requireAuth } from '../middleware/auth';

const router = Router();

router.get('/summary', requireAuth, (req, res) => {
  const { from, to } = req.query;
  res.json({ success: true, data: { dateRange: { from, to }, totalPosts: 0 } });
});

router.get('/posts/:postId', requireAuth, (req, res) => {
  res.json({ success: true, data: { postId: req.params.postId } });
});

router.post('/fetch', requireAuth, (_req, res) => {
  res.json({ success: true, data: { queued: true } });
});

router.get('/export', requireAuth, (req, res) => {
  res.setHeader('Content-Type', 'text/csv');
  res.setHeader('Content-Disposition', 'attachment; filename=omnipost-analytics.csv');
  res.send('date,platform,impressions,reach,likes,comments,shares\n');
});

export default router;

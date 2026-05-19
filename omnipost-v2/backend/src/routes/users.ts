// ── routes/users.ts ─────────────────────────────────────────────
import { Router } from 'express';
import { requireAuth } from '../middleware/auth';
const router = Router();
router.get('/profile',      requireAuth, (req, res) => res.json({ success: true, data: { id: (req as any).userId } }));
router.patch('/profile',    requireAuth, (req, res) => res.json({ success: true, data: req.body, message: 'Profile updated' }));
router.delete('/account',   requireAuth, (req, res) => res.json({ success: true, data: { deleted: true } }));
export default router;

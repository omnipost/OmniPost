// ── routes/posts.ts ─────────────────────────────────────────────
import { Router } from 'express';
import { requireAuth } from '../middleware/auth';
import { publishPost, listPosts, getPost, deletePost, retryPost, saveDraft } from '../controllers/postController';

const router = Router();
router.post('/publish',      requireAuth, publishPost);
router.post('/draft',        requireAuth, saveDraft);
router.get('/',              requireAuth, listPosts);
router.get('/:id',           requireAuth, getPost);
router.delete('/:id',        requireAuth, deletePost);
router.post('/:id/retry',    requireAuth, retryPost);
export default router;

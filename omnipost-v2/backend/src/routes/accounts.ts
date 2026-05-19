// ── routes/accounts.ts ──────────────────────────────────────────
import { Router } from 'express';
import { requireAuth } from '../middleware/auth';
import { v4 as uuidv4 } from 'uuid';

const router = Router();

/* List all connected accounts for current user */
router.get('/', requireAuth, (_req, res) => {
  res.json({ success: true, data: [] });
});

/* Initiate OAuth for a platform */
router.get('/connect/:platform', requireAuth, (req, res) => {
  const { platform } = req.params;
  const state = uuidv4();
  // TODO: Build OAuth URL per platform and redirect
  // const url = buildOAuthUrl(platform, state);
  // store state in Redis for verification
  // return res.redirect(url);
  res.json({ success: true, data: { platform, oauthUrl: `https://oauth.example.com/${platform}?state=${state}` } });
});

/* OAuth callback handler */
router.get('/callback/:platform', async (req, res) => {
  const { platform } = req.params;
  const { code, state } = req.query;
  // TODO: Exchange code for access + refresh tokens
  // Encrypt tokens with AES-256 before storing in DB
  res.redirect(`${process.env.FRONTEND_URL}/settings/accounts?connected=${platform}`);
});

/* Disconnect a platform account */
router.delete('/:accountId', requireAuth, (req, res) => {
  // TODO: Revoke token with platform API, delete from DB
  res.json({ success: true, data: { disconnected: true } });
});

/* Refresh a token manually */
router.post('/:accountId/refresh', requireAuth, (req, res) => {
  // TODO: Use refresh token to get new access token
  res.json({ success: true, data: { refreshed: true } });
});

export default router;

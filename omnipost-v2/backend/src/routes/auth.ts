// ── routes/auth.ts ──────────────────────────────────────────────
import { Router } from 'express';
import { register, login, sendOtp, verifyOtp, getMe, refreshToken } from '../controllers/authController';
import { requireAuth } from '../middleware/auth';

const router = Router();
router.post('/register',    register);
router.post('/login',       login);
router.post('/otp/send',    sendOtp);
router.post('/otp/verify',  verifyOtp);
router.post('/refresh',     refreshToken);
router.get('/me',           requireAuth, getMe);
export default router;

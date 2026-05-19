import { Router } from 'express';
import { requireAuth } from '../middleware/auth';
const router = Router();
router.get('/subscription', requireAuth, (_req, res) => {
  res.json({ success: true, data: { plan: 'creator', status: 'active' } });
});
router.post('/subscribe', requireAuth, (req, res) => {
  const { plan } = req.body;
  res.json({ success: true, data: { plan, paymentUrl: 'https://razorpay.com/pay/xxx' } });
});
router.post('/cancel', requireAuth, (_req, res) => {
  res.json({ success: true, data: { cancelled: true } });
});
router.get('/invoices', requireAuth, (_req, res) => {
  res.json({ success: true, data: [] });
});
export default router;

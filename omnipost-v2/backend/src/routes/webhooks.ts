import { Router } from 'express';
const router = Router();
router.post('/meta', (req, res) => {
  if (req.query['hub.mode'] === 'subscribe') return res.send(req.query['hub.challenge']);
  res.sendStatus(200);
});
router.post('/razorpay', (_req, res) => { res.sendStatus(200); });
export default router;

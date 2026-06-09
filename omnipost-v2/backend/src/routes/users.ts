// ── routes/users.ts ─────────────────────────────────────────────
import { Router, Request, Response } from 'express';
import mongoose from 'mongoose';
import { requireAuth } from '../middleware/auth';
import User from '../models/User';

const router = Router();

// ── GET /api/users/profile ──────────────────────────────────────
router.get('/profile', requireAuth, async (req: Request, res: Response) => {
  try {
    const userId = (req as any).userId;
    if (!mongoose.isValidObjectId(userId))
      return res.status(400).json({ success: false, error: 'Invalid user ID' });

    const user = await User.findById(userId);
    if (!user) return res.status(404).json({ success: false, error: 'User not found' });

    res.json({
      success: true,
      data: {
        id:         user._id.toString(),
        name:       user.name,
        email:      user.email,
        mobile:     user.mobile || null,
        bio:        user.bio || '',
        plan:       user.plan,
        isVerified: user.isVerified,
        createdAt:  user.createdAt,
      },
    });
  } catch {
    res.status(500).json({ success: false, error: 'Failed to fetch profile' });
  }
});

// ── PATCH /api/users/profile ────────────────────────────────────
router.patch('/profile', requireAuth, async (req: Request, res: Response) => {
  try {
    const userId = (req as any).userId;
    if (!mongoose.isValidObjectId(userId))
      return res.status(400).json({ success: false, error: 'Invalid user ID' });

    const { name, bio, mobile } = req.body;

    // Build only the fields that were sent
    const updates: Record<string, any> = {};
    if (name  !== undefined) updates.name   = String(name).trim();
    if (bio   !== undefined) updates.bio    = String(bio).trim();
    if (mobile !== undefined) updates.mobile = mobile ? String(mobile).trim() : undefined;

    const user = await User.findByIdAndUpdate(userId, { $set: updates }, { new: true, runValidators: true });
    if (!user) return res.status(404).json({ success: false, error: 'User not found' });

    res.json({
      success: true,
      message: 'Profile updated successfully',
      data: {
        id:         user._id.toString(),
        name:       user.name,
        email:      user.email,
        mobile:     user.mobile || null,
        bio:        user.bio || '',
        plan:       user.plan,
        isVerified: user.isVerified,
        createdAt:  user.createdAt,
      },
    });
  } catch (err: any) {
    // Handle duplicate mobile number
    if (err?.code === 11000) {
      return res.status(409).json({ success: false, error: 'Mobile number already in use' });
    }
    res.status(500).json({ success: false, error: 'Failed to update profile' });
  }
});

// ── DELETE /api/users/account ───────────────────────────────────
router.delete('/account', requireAuth, async (req: Request, res: Response) => {
  try {
    const userId = (req as any).userId;
    await User.findByIdAndDelete(userId);
    res.json({ success: true, data: { deleted: true } });
  } catch {
    res.status(500).json({ success: false, error: 'Failed to delete account' });
  }
});

export default router;

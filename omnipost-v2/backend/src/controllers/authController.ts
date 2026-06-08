import { Request, Response } from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import mongoose from 'mongoose';
import User, { IUserDocument } from '../models/User';
import PasswordReset from '../models/PasswordReset';
import { sendEmail, passwordResetEmail } from '../services/notifications';

const JWT_SECRET = process.env.JWT_SECRET as string;
if (!JWT_SECRET) throw new Error("JWT_SECRET is not defined in .env");

const OTP_EXPIRY_MS = 5 * 60 * 1000;
const RESET_EXPIRY_MS = 15 * 60 * 1000;

const otpStore = new Map<string, { otp: string; expiresAt: number }>();

function signToken(userId: string) {
  return jwt.sign({ userId }, JWT_SECRET, { expiresIn: process.env.JWT_EXPIRES_IN || '3d' } as jwt.SignOptions);
}

function formatUser(user: IUserDocument) {
  return {
    id: user._id.toString(),
    name: user.name,
    email: user.email,
    mobile: user.mobile || null,
    plan: user.plan,
    isVerified: user.isVerified,
  };
}

export async function register(req: Request, res: Response) {
  try {
    const { name, email, password, mobile } = req.body;
    if (!name || !email || !password) return res.status(400).json({ success: false, error: 'Required fields missing' });

    const userEmail = String(email).trim().toLowerCase();
    if (await User.findOne({ email: userEmail })) return res.status(409).json({ success: false, error: 'Email already exists' });

    const user = await User.create({
      name: String(name).trim(),
      email: userEmail,
      mobile: mobile ? String(mobile).trim() : undefined,
      passwordHash: await bcrypt.hash(password, 12),
      plan: 'free',
      isVerified: false,
      createdAt: new Date(),
    });

    res.json({ success: true, data: { user: formatUser(user), accessToken: signToken(user._id.toString()) } });
  } catch {
    res.status(500).json({ success: false, error: 'Registration failed' });
  }
}

export async function login(req: Request, res: Response) {
  try {
    const { email, password } = req.body;
    if (!email || !password) return res.status(400).json({ success: false, error: 'Required fields missing' });

    const user = await User.findOne({ email: String(email).trim().toLowerCase() });
    if (!user || !user.passwordHash || !(await bcrypt.compare(password, user.passwordHash))) {
      return res.status(401).json({ success: false, error: 'Invalid credentials' });
    }

    res.json({ success: true, data: { user: formatUser(user), accessToken: signToken(user._id.toString()) } });
  } catch {
    res.status(500).json({ success: false, error: 'Login failed' });
  }
}

export async function sendOtp(req: Request, res: Response) {
  try {
    const mobile = req.body.mobile?.toString().trim();
    if (!mobile) return res.status(400).json({ success: false, error: 'Mobile required' });

    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    otpStore.set(mobile, { otp, expiresAt: Date.now() + OTP_EXPIRY_MS });
    
    // In production, send SMS here. For dev, we just log it implicitly via response or terminal if needed.
    res.json({ success: true, message: 'OTP sent successfully' });
  } catch {
    res.status(500).json({ success: false, error: 'Failed to send OTP' });
  }
}

export async function verifyOtp(req: Request, res: Response) {
  try {
    const mobile = req.body.mobile?.toString().trim();
    const otp = req.body.otp?.toString().trim();
    if (!mobile || !otp) return res.status(400).json({ success: false, error: 'Mobile and OTP required' });

    const entry = otpStore.get(mobile);
    if (!entry || entry.expiresAt < Date.now() || entry.otp !== otp) {
      if (entry && entry.expiresAt < Date.now()) otpStore.delete(mobile);
      return res.status(400).json({ success: false, error: 'Invalid or expired OTP' });
    }
    
    otpStore.delete(mobile);

    let user = await User.findOne({ mobile });
    if (!user) {
      user = await User.create({
        name: `User ${mobile.slice(-4)}`,
        email: `${mobile}@omnipost.local`,
        mobile,
        plan: 'free',
        isVerified: true,
        createdAt: new Date(),
      });
    }

    res.json({ success: true, data: { user: formatUser(user), accessToken: signToken(user._id.toString()) } });
  } catch {
    res.status(500).json({ success: false, error: 'OTP verification failed' });
  }
}

export async function getMe(req: Request, res: Response) {
  try {
    const userId = (req as any).userId;
    if (!mongoose.isValidObjectId(userId)) return res.status(400).json({ success: false, error: 'Invalid user ID' });

    const user = await User.findById(userId);
    if (!user) return res.status(404).json({ success: false, error: 'User not found' });

    res.json({ success: true, data: formatUser(user) });
  } catch {
    res.status(500).json({ success: false, error: 'Failed to fetch user' });
  }
}

export async function forgotPassword(req: Request, res: Response) {
  try {
    const email = req.body.email?.toString().trim().toLowerCase();
    if (!email) return res.status(400).json({ success: false, error: 'Email required' });

    const user = await User.findOne({ email });
    const message = 'If registered, a reset code was sent.';
    if (!user) return res.json({ success: true, message });

    const code = Math.floor(100000 + Math.random() * 900000).toString();
    const codeHash = await bcrypt.hash(code, 10);

    await PasswordReset.findOneAndUpdate(
      { email },
      { email, codeHash, expiresAt: new Date(Date.now() + RESET_EXPIRY_MS), createdAt: new Date() },
      { upsert: true }
    );

    sendEmail({ to: email, subject: 'Reset Password', html: passwordResetEmail(user.name, code) }).catch(() => {});
    
    res.json({ success: true, message, devCode: process.env.NODE_ENV !== 'production' ? code : undefined });
  } catch {
    res.status(500).json({ success: false, error: 'Failed to process request' });
  }
}

export async function resetPassword(req: Request, res: Response) {
  try {
    const { email, code, password } = req.body;
    if (!email || !code || !password) return res.status(400).json({ success: false, error: 'Missing fields' });
    if (String(password).length < 8) return res.status(400).json({ success: false, error: 'Password too short' });

    const userEmail = String(email).trim().toLowerCase();
    const resetDoc = await PasswordReset.findOne({ email: userEmail });
    if (!resetDoc || resetDoc.expiresAt < new Date() || !(await bcrypt.compare(String(code).trim(), resetDoc.codeHash))) {
      return res.status(400).json({ success: false, error: 'Invalid or expired code' });
    }

    const user = await User.findOneAndUpdate({ email: userEmail }, { passwordHash: await bcrypt.hash(password, 12) }, { new: true });
    await PasswordReset.deleteOne({ email: userEmail });

    res.json({ success: true, data: formatUser(user as IUserDocument), message: 'Password reset' });
  } catch {
    res.status(500).json({ success: false, error: 'Failed to reset password' });
  }
}

export async function refreshToken(req: Request, res: Response) {
  try {
    const token = req.body.refreshToken;
    if (!token) return res.status(400).json({ success: false, error: 'refreshToken required' });
    
    const payload = jwt.verify(token, JWT_SECRET) as { userId: string };
    res.json({ success: true, data: { accessToken: signToken(payload.userId) } });
  } catch {
    res.status(401).json({ success: false, error: 'Invalid token' });
  }
}

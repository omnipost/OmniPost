// ─── Auth Controller ─────────────────────────────────────────────
import { Request, Response } from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import mongoose from 'mongoose';
import User, { IUserDocument } from '../models/User';
import PasswordReset from '../models/PasswordReset';
import { logger } from '../config/logger';
import { sendEmail, passwordResetEmail } from '../services/notifications';

const JWT_SECRET = process.env.JWT_SECRET || 'dev_secret_replace_in_prod';
const OTP_EXPIRY_MS = 5 * 60 * 1000;
const RESET_EXPIRY_MS = 15 * 60 * 1000;

const otpStore = new Map<string, { hash: string; expiresAt: number }>();

function signToken(userId: string): string {
  return jwt.sign({ userId }, JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN || '3d',
  } as jwt.SignOptions);
}

function ok(res: Response, data: unknown, message?: string) {
  return res.json({ success: true, data, message });
}

function fail(res: Response, status: number, error: string) {
  return res.status(status).json({ success: false, error });
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

/* ── Register ─────────────────────────────────────────────── */
export async function register(req: Request, res: Response) {
  try {
    const { name, email, password, mobile } = req.body;

    if (!name || !email || !password)
      return fail(res, 400, 'name, email and password are required');

    const normalizedEmail = String(email).trim().toLowerCase();
    const normalizedMobile = mobile ? String(mobile).trim() : undefined;

    const existing = await User.findOne({ email: normalizedEmail }).exec();
    if (existing) return fail(res, 409, 'Email already registered');

    const passwordHash = await bcrypt.hash(password, 12);
    const createdAt = new Date();

    const createdUser = await User.create({
      name: name.trim(),
      email: normalizedEmail,
      ...(normalizedMobile ? { mobile: normalizedMobile } : {}),
      passwordHash,
      plan: 'free',
      isVerified: false,
      createdAt,
    });

    const user = formatUser(createdUser);
    const token = signToken(user.id);

    logger.info(`New user registered: ${normalizedEmail}`);
    return ok(res, { user, accessToken: token }, 'Account created successfully');
  } catch (err: unknown) {
    logger.error('Register error:', err);
    return fail(res, 500, 'Registration failed');
  }
}

/* ── Login ────────────────────────────────────────────────── */
export async function login(req: Request, res: Response) {
  try {
    const { email, password } = req.body;

    if (!email || !password)
      return fail(res, 400, 'email and password are required');

    const normalizedEmail = String(email).trim().toLowerCase();
    const user = await User.findOne({ email: normalizedEmail }).exec();
    if (!user || !user.passwordHash)
      return fail(res, 401, 'Invalid credentials');

    const valid = await bcrypt.compare(password, user.passwordHash);
    if (!valid) return fail(res, 401, 'Invalid credentials');

    const token = signToken(user._id.toString());
    logger.info(`User logged in: ${normalizedEmail}`);
    return ok(res, { user: formatUser(user), accessToken: token });
  } catch (err: unknown) {
    logger.error('Login error:', err);
    return fail(res, 500, 'Login failed');
  }
}

/* ── Send OTP ─────────────────────────────────────────────── */
export async function sendOtp(req: Request, res: Response) {
  try {
    const { mobile } = req.body;
    if (!mobile) return fail(res, 400, 'mobile number is required');

    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    const hash = await bcrypt.hash(otp, 10);
    otpStore.set(String(mobile).trim(), { hash, expiresAt: Date.now() + OTP_EXPIRY_MS });

    logger.info(`OTP sent to ${mobile} (dev OTP: ${otp})`);
    return ok(res, { message: 'OTP sent successfully' });
  } catch (err: unknown) {
    logger.error('sendOtp error:', err);
    return fail(res, 500, 'Failed to send OTP');
  }
}

/* ── Verify OTP & Login ───────────────────────────────────── */
export async function verifyOtp(req: Request, res: Response) {
  try {
    const { mobile, otp } = req.body;
    if (!mobile || !otp) return fail(res, 400, 'mobile and otp are required');

    const entry = otpStore.get(String(mobile).trim());
    if (!entry || entry.expiresAt < Date.now()) {
      otpStore.delete(String(mobile).trim());
      return fail(res, 400, 'OTP expired');
    }

    const valid = await bcrypt.compare(otp, entry.hash);
    if (!valid) return fail(res, 400, 'Invalid OTP');
    otpStore.delete(String(mobile).trim());

    const normalizedMobile = String(mobile).trim();
    let user = await User.findOne({ mobile: normalizedMobile }).exec();

    if (!user) {
      const createdAt = new Date();
      user = await User.create({
        name: `User ${normalizedMobile.slice(-4)}`,
        email: `${normalizedMobile}@omnipost.local`,
        mobile: normalizedMobile,
        plan: 'free',
        isVerified: true,
        createdAt,
      });
    }

    const token = signToken(user._id.toString());
    return ok(res, { user: formatUser(user), accessToken: token });
  } catch (err: unknown) {
    logger.error('verifyOtp error:', err);
    return fail(res, 500, 'OTP verification failed');
  }
}

/* ── Get current user ─────────────────────────────────────── */
export async function getMe(req: Request, res: Response) {
  try {
    const userId = (req as any).userId;
    if (!userId) return fail(res, 401, 'Unauthorized');

    if (!mongoose.isValidObjectId(userId)) {
      return fail(res, 400, 'Invalid user ID');
    }

    const user = await User.findById(userId).exec();
    if (!user) return fail(res, 404, 'User not found');

    return ok(res, formatUser(user));
  } catch (err: unknown) {
    logger.error('getMe error:', err);
    return fail(res, 500, 'Failed to fetch user');
  }
}

/* ── Forgot password ──────────────────────────────────────── */
export async function forgotPassword(req: Request, res: Response) {
  try {
    const { email } = req.body;
    if (!email) return fail(res, 400, 'email is required');

    const normalizedEmail = String(email).trim().toLowerCase();
    const user = await User.findOne({ email: normalizedEmail }).exec();

    const message = 'If that email is registered, a reset code has been sent.';
    if (!user) return ok(res, { message });

    const code = Math.floor(100000 + Math.random() * 900000).toString();
    const codeHash = await bcrypt.hash(code, 10);
    const expiresAt = new Date(Date.now() + RESET_EXPIRY_MS);

    await PasswordReset.findOneAndUpdate(
      { email: normalizedEmail },
      { email: normalizedEmail, codeHash, expiresAt, createdAt: new Date() },
      { upsert: true, new: true, setDefaultsOnInsert: true }
    ).exec();

    try {
      await sendEmail({
        to: normalizedEmail,
        subject: 'Reset your OmniPost password',
        html: passwordResetEmail(user.name, code),
      });
    } catch (emailErr) {
      logger.warn(`Email not sent for ${normalizedEmail} — reset code logged for dev: ${code}`);
    }

    const payload: Record<string, string> = { message };
    if (process.env.NODE_ENV !== 'production') {
      payload.devCode = code;
    }
    return ok(res, payload);
  } catch (err: unknown) {
    logger.error('forgotPassword error:', err);
    return fail(res, 500, 'Failed to process password reset request');
  }
}

/* ── Reset password ───────────────────────────────────────── */
export async function resetPassword(req: Request, res: Response) {
  try {
    const { email, code, password } = req.body;
    if (!email || !code || !password)
      return fail(res, 400, 'email, code and password are required');
    if (String(password).length < 8)
      return fail(res, 400, 'Password must be at least 8 characters');

    const normalizedEmail = String(email).trim().toLowerCase();
    const resetDoc = await PasswordReset.findOne({ email: normalizedEmail }).exec();

    if (!resetDoc || resetDoc.expiresAt < new Date())
      return fail(res, 400, 'Reset code expired or invalid');

    const validCode = await bcrypt.compare(String(code).trim(), resetDoc.codeHash);
    if (!validCode) return fail(res, 400, 'Invalid reset code');

    const passwordHash = await bcrypt.hash(password, 12);
    const user = await User.findOneAndUpdate({ email: normalizedEmail }, { passwordHash }, { new: true }).exec();
    if (!user) return fail(res, 404, 'User not found');

    await PasswordReset.deleteOne({ email: normalizedEmail }).exec();

    return ok(res, formatUser(user), 'Password reset successfully');
  } catch (err: unknown) {
    logger.error('resetPassword error:', err);
    return fail(res, 500, 'Failed to reset password');
  }
}

/* ── Refresh token ────────────────────────────────────────── */
export async function refreshToken(req: Request, res: Response) {
  try {
    const { refreshToken: token } = req.body;
    if (!token) return fail(res, 400, 'refreshToken is required');
    const payload = jwt.verify(token, JWT_SECRET) as { userId: string };
    const newToken = signToken(payload.userId);
    return ok(res, { accessToken: newToken });
  } catch {
    return fail(res, 401, 'Invalid or expired refresh token');
  }
}

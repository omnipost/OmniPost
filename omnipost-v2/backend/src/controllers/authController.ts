// ─── Auth Controller ─────────────────────────────────────────────
import { Request, Response } from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { ObjectId } from 'mongodb';
import { getDb } from '../config/database';
import { logger } from '../config/logger';

const JWT_SECRET = process.env.JWT_SECRET || 'dev_secret_replace_in_prod';
const OTP_EXPIRY_MS = 5 * 60 * 1000;

interface UserDoc {
  _id?: any;
  name: string;
  email: string;
  mobile?: string;
  passwordHash?: string;
  plan: string;
  isVerified: boolean;
  createdAt: Date;
}

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

function formatUser(user: UserDoc & { _id: any }) {
  return {
    id: user._id.toString(),
    name: user.name,
    email: user.email,
    mobile: user.mobile || null,
    plan: user.plan,
    isVerified: user.isVerified,
  };
}

function getUsersCollection() {
  return getDb().collection<UserDoc>('users');
}

/* ── Register ─────────────────────────────────────────────── */
export async function register(req: Request, res: Response) {
  try {
    const { name, email, password, mobile } = req.body;

    if (!name || !email || !password)
      return fail(res, 400, 'name, email and password are required');

    const users = getUsersCollection();
    const normalizedEmail = String(email).trim().toLowerCase();

    const existing = await users.findOne({ email: normalizedEmail });
    if (existing) return fail(res, 409, 'Email already registered');

    const passwordHash = await bcrypt.hash(password, 12);
    const createdAt = new Date();
    const result = await users.insertOne({
      name: name.trim(),
      email: normalizedEmail,
      mobile: mobile ? String(mobile).trim() : undefined,
      passwordHash,
      plan: 'free',
      isVerified: false,
      createdAt,
    });

    const user = formatUser({ _id: result.insertedId, name: name.trim(), email: normalizedEmail, mobile: mobile ? String(mobile).trim() : undefined, plan: 'free', isVerified: false, createdAt });
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

    const users = getUsersCollection();
    const normalizedEmail = String(email).trim().toLowerCase();
    const user = await users.findOne({ email: normalizedEmail });
    if (!user || !user.passwordHash)
      return fail(res, 401, 'Invalid credentials');

    const valid = await bcrypt.compare(password, user.passwordHash);
    if (!valid) return fail(res, 401, 'Invalid credentials');

    const token = signToken(user._id.toString());
    logger.info(`User logged in: ${normalizedEmail}`);
    return ok(res, { user: formatUser({ ...user, _id: user._id }), accessToken: token });
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

    const users = getUsersCollection();
    const normalizedMobile = String(mobile).trim();
    let user = await users.findOne({ mobile: normalizedMobile });

    if (!user) {
      const createdAt = new Date();
      const result = await users.insertOne({
        name: `User ${normalizedMobile.slice(-4)}`,
        email: `${normalizedMobile}@omnipost.local`,
        mobile: normalizedMobile,
        plan: 'free',
        isVerified: true,
        createdAt,
      });
      user = { _id: result.insertedId, name: `User ${normalizedMobile.slice(-4)}`, email: `${normalizedMobile}@omnipost.local`, mobile: normalizedMobile, plan: 'free', isVerified: true, createdAt };
    }

    const token = signToken(user._id.toString());
    return ok(res, { user: formatUser({ ...user, _id: user._id }), accessToken: token });
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

    const users = getUsersCollection();
    const user = await users.findOne({ _id: new ObjectId(userId) });
    if (!user) return fail(res, 404, 'User not found');

    return ok(res, formatUser({ ...user, _id: user._id }));
  } catch (err: unknown) {
    logger.error('getMe error:', err);
    return fail(res, 500, 'Failed to fetch user');
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

// ─── Auth Controller ─────────────────────────────────────────────
import { Request, Response } from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { v4 as uuidv4 } from 'uuid';
import { db } from '../config/database';
import { logger } from '../config/logger';

const JWT_SECRET = process.env.JWT_SECRET || 'dev_secret_replace_in_prod';

/* ── Helpers ──────────────────────────────────────────────── */
function signToken(userId: string): string {
  return jwt.sign({ userId }, JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN || '7d',
  } as jwt.SignOptions);
}

function ok(res: Response, data: unknown, message?: string) {
  return res.json({ success: true, data, message });
}

function fail(res: Response, status: number, error: string) {
  return res.status(status).json({ success: false, error });
}

/* ── Register ─────────────────────────────────────────────── */
export async function register(req: Request, res: Response) {
  try {
    const { name, email, password, mobile } = req.body;

    if (!name || !email || !password)
      return fail(res, 400, 'name, email and password are required');

    // TODO: check DB for existing user
    // const existing = await db.query('SELECT id FROM users WHERE email=$1', [email]);
    // if (existing.rows.length) return fail(res, 409, 'Email already registered');

    const passwordHash = await bcrypt.hash(password, 12);
    const userId = uuidv4();

    // TODO: INSERT into users table
    // await db.query(
    //   'INSERT INTO users (id,name,email,mobile,password_hash,plan) VALUES ($1,$2,$3,$4,$5,$6)',
    //   [userId, name, email, mobile, passwordHash, 'free']
    // );

    const token = signToken(userId);

    // TODO: Send welcome email via SES

    logger.info(`New user registered: ${email}`);

    return ok(res, {
      user: { id: userId, name, email, mobile, plan: 'free', isVerified: false },
      accessToken: token,
    }, 'Account created successfully');

  } catch (err) {
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

    // TODO: fetch user from DB
    // const result = await db.query('SELECT * FROM users WHERE email=$1', [email]);
    // if (!result.rows.length) return fail(res, 401, 'Invalid credentials');
    // const user = result.rows[0];
    // const valid = await bcrypt.compare(password, user.password_hash);
    // if (!valid) return fail(res, 401, 'Invalid credentials');

    // Mock response for development
    const mockUser = { id: 'usr_01', name: 'Priya Sharma', email, plan: 'creator', isVerified: true };
    const token = signToken(mockUser.id);

    logger.info(`User logged in: ${email}`);
    return ok(res, { user: mockUser, accessToken: token });

  } catch (err) {
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

    // TODO: store OTP in Redis with 5min expiry
    // await redis.setEx(`otp:${mobile}`, 300, await bcrypt.hash(otp, 10));

    // TODO: send via MSG91
    // await smsService.send(mobile, `Your OmniPost OTP is ${otp}. Valid for 5 minutes.`);

    logger.info(`OTP sent to ${mobile} (dev: ${otp})`);

    return ok(res, { message: 'OTP sent successfully' });
  } catch (err) {
    logger.error('sendOtp error:', err);
    return fail(res, 500, 'Failed to send OTP');
  }
}

/* ── Verify OTP & Login ───────────────────────────────────── */
export async function verifyOtp(req: Request, res: Response) {
  try {
    const { mobile, otp } = req.body;
    if (!mobile || !otp) return fail(res, 400, 'mobile and otp are required');

    // TODO: retrieve from Redis and verify
    // const stored = await redis.get(`otp:${mobile}`);
    // if (!stored) return fail(res, 400, 'OTP expired');
    // const valid = await bcrypt.compare(otp, stored);
    // if (!valid) return fail(res, 400, 'Invalid OTP');
    // await redis.del(`otp:${mobile}`);

    // TODO: find or create user
    const userId = uuidv4();
    const token  = signToken(userId);

    return ok(res, {
      user: { id: userId, mobile, plan: 'free', isVerified: true },
      accessToken: token,
    });
  } catch (err) {
    logger.error('verifyOtp error:', err);
    return fail(res, 500, 'OTP verification failed');
  }
}

/* ── Get current user ─────────────────────────────────────── */
export async function getMe(req: Request, res: Response) {
  try {
    // req.userId set by auth middleware
    // const result = await db.query('SELECT id,name,email,mobile,plan,avatar,bio,is_verified,created_at FROM users WHERE id=$1', [(req as any).userId]);
    // if (!result.rows.length) return fail(res, 404, 'User not found');
    return ok(res, { id: (req as any).userId, name: 'Priya Sharma', plan: 'creator' });
  } catch (err) {
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

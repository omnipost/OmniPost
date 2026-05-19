// src/services/tokenRefresh.ts
// Automatically refresh expiring OAuth tokens for each platform

import axios from 'axios';
import { db } from '../config/database';
import { encrypt, decrypt } from '../utils/encryption';
import { logger } from '../config/logger';

interface TokenResult {
  accessToken:  string;
  refreshToken?: string;
  expiresAt:    Date;
}

/* ── Meta (Instagram / Facebook / Threads) ──────────────────── */
async function refreshMetaToken(refreshToken: string): Promise<TokenResult> {
  // Meta long-lived tokens last 60 days — extend via Graph API
  const res = await axios.get('https://graph.facebook.com/v19.0/oauth/access_token', {
    params: {
      grant_type:        'fb_exchange_token',
      client_id:         process.env.META_APP_ID,
      client_secret:     process.env.META_APP_SECRET,
      fb_exchange_token: refreshToken,
    },
  });
  const expiresAt = new Date(Date.now() + res.data.expires_in * 1000);
  return { accessToken: res.data.access_token, expiresAt };
}

/* ── Google (YouTube) ───────────────────────────────────────── */
async function refreshGoogleToken(refreshToken: string): Promise<TokenResult> {
  const res = await axios.post('https://oauth2.googleapis.com/token', {
    client_id:     process.env.GOOGLE_CLIENT_ID,
    client_secret: process.env.GOOGLE_CLIENT_SECRET,
    refresh_token: refreshToken,
    grant_type:    'refresh_token',
  });
  const expiresAt = new Date(Date.now() + res.data.expires_in * 1000);
  return { accessToken: res.data.access_token, refreshToken, expiresAt };
}

/* ── LinkedIn ───────────────────────────────────────────────── */
async function refreshLinkedInToken(refreshToken: string): Promise<TokenResult> {
  const res = await axios.post(
    'https://www.linkedin.com/oauth/v2/accessToken',
    new URLSearchParams({
      grant_type:    'refresh_token',
      refresh_token: refreshToken,
      client_id:     process.env.LINKEDIN_CLIENT_ID || '',
      client_secret: process.env.LINKEDIN_CLIENT_SECRET || '',
    }),
    { headers: { 'Content-Type': 'application/x-www-form-urlencoded' } }
  );
  const expiresAt = new Date(Date.now() + res.data.expires_in * 1000);
  return { accessToken: res.data.access_token, refreshToken: res.data.refresh_token, expiresAt };
}

/* ── Twitter / X ────────────────────────────────────────────── */
async function refreshTwitterToken(refreshToken: string): Promise<TokenResult> {
  const credentials = Buffer.from(
    `${process.env.TWITTER_CLIENT_ID}:${process.env.TWITTER_CLIENT_SECRET}`
  ).toString('base64');

  const res = await axios.post(
    'https://api.twitter.com/2/oauth2/token',
    new URLSearchParams({ grant_type: 'refresh_token', refresh_token: refreshToken }),
    { headers: { Authorization: `Basic ${credentials}`, 'Content-Type': 'application/x-www-form-urlencoded' } }
  );
  const expiresAt = new Date(Date.now() + res.data.expires_in * 1000);
  return { accessToken: res.data.access_token, refreshToken: res.data.refresh_token, expiresAt };
}

/* ── Platform router ────────────────────────────────────────── */
const REFRESHERS: Record<string, (rt: string) => Promise<TokenResult>> = {
  instagram: refreshMetaToken,
  facebook:  refreshMetaToken,
  threads:   refreshMetaToken,
  youtube:   refreshGoogleToken,
  linkedin:  refreshLinkedInToken,
  twitter:   refreshTwitterToken,
};

/* ── Refresh a single account's token ──────────────────────── */
export async function refreshAccountToken(accountId: string): Promise<boolean> {
  try {
    // Fetch account from DB
    const { rows } = await db.query(
      'SELECT id, platform, refresh_token_enc FROM social_accounts WHERE id = $1',
      [accountId]
    );
    if (!rows.length) throw new Error(`Account ${accountId} not found`);

    const account       = rows[0];
    const refresher     = REFRESHERS[account.platform];
    if (!refresher) {
      logger.warn(`No refresher for platform: ${account.platform}`);
      return false;
    }

    // Decrypt stored refresh token
    const refreshToken = decrypt(account.refresh_token_enc);

    // Get new tokens
    const result = await refresher(refreshToken);

    // Encrypt and store new tokens
    await db.query(
      `UPDATE social_accounts
       SET access_token_enc  = $1,
           refresh_token_enc = $2,
           token_expires_at  = $3,
           status            = 'connected',
           updated_at        = NOW()
       WHERE id = $4`,
      [
        encrypt(result.accessToken),
        result.refreshToken ? encrypt(result.refreshToken) : account.refresh_token_enc,
        result.expiresAt,
        accountId,
      ]
    );

    logger.info(`Token refreshed for account ${accountId} (${account.platform})`);
    return true;
  } catch (err) {
    logger.error(`Token refresh failed for account ${accountId}:`, err);
    // Mark as expired in DB
    await db.query(
      "UPDATE social_accounts SET status = 'expired', updated_at = NOW() WHERE id = $1",
      [accountId]
    );
    return false;
  }
}

/* ── Batch refresh all expiring tokens (run every hour) ─────── */
export async function refreshExpiringTokens(): Promise<void> {
  // Find tokens expiring in the next 24 hours
  const { rows } = await db.query(`
    SELECT id, platform FROM social_accounts
    WHERE status = 'connected'
      AND token_expires_at IS NOT NULL
      AND token_expires_at < NOW() + INTERVAL '24 hours'
  `);

  logger.info(`Found ${rows.length} tokens expiring soon`);

  for (const account of rows) {
    await refreshAccountToken(account.id);
    // Small delay to avoid rate limiting
    await new Promise(r => setTimeout(r, 500));
  }
}

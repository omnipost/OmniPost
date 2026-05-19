// src/utils/encryption.ts
// AES-256-GCM encryption for storing OAuth tokens securely in DB
import crypto from 'crypto';

const ALGORITHM = 'aes-256-gcm';
const KEY_HEX   = process.env.TOKEN_ENCRYPTION_KEY || '';

function getKey(): Buffer {
  if (!KEY_HEX || KEY_HEX.length < 32) {
    throw new Error('TOKEN_ENCRYPTION_KEY must be at least 32 hex chars in .env');
  }
  return Buffer.from(KEY_HEX.padEnd(64, '0').slice(0, 64), 'hex');
}

/**
 * Encrypt plaintext string → "iv:authTag:ciphertext" (all hex)
 * Store this string in DB — never store raw tokens.
 */
export function encrypt(plaintext: string): string {
  const key  = getKey();
  const iv   = crypto.randomBytes(12); // 96-bit IV for GCM
  const cipher = crypto.createCipheriv(ALGORITHM, key, iv);

  const encrypted = Buffer.concat([
    cipher.update(plaintext, 'utf8'),
    cipher.final(),
  ]);
  const authTag = cipher.getAuthTag();

  return `${iv.toString('hex')}:${authTag.toString('hex')}:${encrypted.toString('hex')}`;
}

/**
 * Decrypt "iv:authTag:ciphertext" back to plaintext string
 */
export function decrypt(encoded: string): string {
  const key  = getKey();
  const parts = encoded.split(':');
  if (parts.length !== 3) throw new Error('Invalid encrypted token format');

  const [ivHex, authTagHex, ciphertextHex] = parts;
  const iv         = Buffer.from(ivHex,         'hex');
  const authTag    = Buffer.from(authTagHex,    'hex');
  const ciphertext = Buffer.from(ciphertextHex, 'hex');

  const decipher = crypto.createDecipheriv(ALGORITHM, key, iv);
  decipher.setAuthTag(authTag);

  const decrypted = Buffer.concat([
    decipher.update(ciphertext),
    decipher.final(),
  ]);
  return decrypted.toString('utf8');
}

/**
 * Hash a value (e.g. OTP) using SHA-256 for storage
 * Use bcrypt for passwords — this is for short-lived codes only
 */
export function sha256(value: string): string {
  return crypto.createHash('sha256').update(value).digest('hex');
}

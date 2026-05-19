import { Pool } from 'pg';
import { logger } from './logger';

export const db = new Pool({
  host:     process.env.DB_HOST     || 'localhost',
  port:     parseInt(process.env.DB_PORT || '5432'),
  database: process.env.DB_NAME     || 'omnipost_db',
  user:     process.env.DB_USER     || 'omnipost_user',
  password: process.env.DB_PASSWORD || '',
  max: 20,
  idleTimeoutMillis: 30_000,
  connectionTimeoutMillis: 2_000,
  ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false,
});

db.on('error', (err) => logger.error('PostgreSQL pool error:', err));

export async function connectDB() {
  try {
    const client = await db.connect();
    const { rows } = await client.query('SELECT NOW()');
    client.release();
    logger.info(`✅ PostgreSQL connected — ${rows[0].now}`);
  } catch (err) {
    logger.error('❌ PostgreSQL connection failed:', err);
    process.exit(1);
  }
}

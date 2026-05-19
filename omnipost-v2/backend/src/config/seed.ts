// src/config/seed.ts
// Seed demo data for development — run: ts-node src/config/seed.ts

import 'dotenv/config';
import { db } from './database';
import bcrypt from 'bcryptjs';
import { v4 as uuid } from 'uuid';
import { logger } from './logger';

async function seed() {
  logger.info('🌱 Seeding demo data...');

  // Demo user
  const userId = uuid();
  const passHash = await bcrypt.hash('Demo@123', 12);

  await db.query(`
    INSERT INTO users (id, name, email, mobile, password_hash, plan, is_verified)
    VALUES ($1, $2, $3, $4, $5, $6, $7)
    ON CONFLICT (email) DO NOTHING
  `, [userId, 'Priya Sharma', 'demo@omnipost.in', '+919876543210', passHash, 'creator', true]);

  logger.info('✅ Demo user: demo@omnipost.in / Demo@123');

  // Demo social accounts (tokens are fake — replace with real OAuth tokens)
  const demoAccounts = [
    { platform: 'instagram', username: '@priya.creates',       displayName: 'Priya Creates',         followers: 124500 },
    { platform: 'twitter',   username: '@priyasharma',         displayName: 'Priya Sharma',           followers: 18200  },
    { platform: 'facebook',  username: 'Priya Sharma Official',displayName: 'Priya Sharma Official',  followers: 45800  },
    { platform: 'youtube',   username: 'Priya Creates',        displayName: 'Priya Creates',          followers: 89200  },
    { platform: 'threads',   username: '@priya.creates',       displayName: 'Priya Creates',          followers: 9800   },
  ];

  for (const acc of demoAccounts) {
    await db.query(`
      INSERT INTO social_accounts
        (id, user_id, platform, platform_user_id, username, display_name, access_token_enc, status, followers_count)
      VALUES ($1,$2,$3,$4,$5,$6,$7,'connected',$8)
      ON CONFLICT (user_id, platform, platform_user_id) DO NOTHING
    `, [uuid(), userId, acc.platform, `demo_${acc.platform}_id`, acc.username, acc.displayName, 'DEMO_TOKEN_REPLACE_WITH_REAL', acc.followers]);
  }

  logger.info(`✅ ${demoAccounts.length} demo social accounts seeded`);

  // Demo subscription
  await db.query(`
    INSERT INTO subscriptions (id, user_id, plan, status, amount, start_date, end_date)
    VALUES ($1,$2,'creator','active',499,NOW(),NOW() + INTERVAL '30 days')
    ON CONFLICT DO NOTHING
  `, [uuid(), userId]);

  logger.info('✅ Demo Creator subscription seeded');
  logger.info('🎉 Seed complete! Login: demo@omnipost.in / Demo@123');

  await db.end();
}

seed().catch(err => {
  logger.error('Seed failed:', err);
  process.exit(1);
});

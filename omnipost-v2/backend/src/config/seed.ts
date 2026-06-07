// src/config/seed.ts
// Seed demo data for development — run: ts-node src/config/seed.ts

import 'dotenv/config';
import bcrypt from 'bcryptjs';
import { v4 as uuid } from 'uuid';
import { connectDB, getDb, mongoClient } from './database';
import { logger } from './logger';

async function seed() {
  logger.info('🌱 Seeding demo data...');
  await connectDB();

  const users = getDb().collection('users');
  const demoEmail = 'demo@omnipost.in';
  const normalizedEmail = demoEmail.toLowerCase();
  const passHash = await bcrypt.hash('Demo@123', 12);

  const existing = await users.findOne({ email: normalizedEmail });
  if (!existing) {
    await users.insertOne({
      name: 'Priya Sharma',
      email: normalizedEmail,
      mobile: '+919876543210',
      passwordHash: passHash,
      plan: 'creator',
      isVerified: true,
      createdAt: new Date(),
    });
  }

  logger.info('✅ Demo user: demo@omnipost.in / Demo@123');
  logger.info('🎉 Seed complete!');

  await mongoClient?.close();
}

seed().catch(err => {
  logger.error('Seed failed:', err);
  process.exit(1);
});

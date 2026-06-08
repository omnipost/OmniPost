// src/config/seed.ts
// Seed demo data for development — run: ts-node src/config/seed.ts

import 'dotenv/config';
import bcrypt from 'bcryptjs';
import { connectDB, disconnectDB } from './database';
import User from '../models/User';
import { logger } from './logger';

async function seed() {
  logger.info('🌱 Seeding demo data...');
  await connectDB();

  const demoEmail = 'demo@omnipost.in';
  const normalizedEmail = demoEmail.toLowerCase();
  const passHash = await bcrypt.hash('Demo@123', 12);

  const existing = await User.findOne({ email: normalizedEmail }).exec();
  if (!existing) {
    await User.create({
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

  await disconnectDB();
}

seed().catch(err => {
  logger.error('Seed failed:', err);
  process.exit(1);
});

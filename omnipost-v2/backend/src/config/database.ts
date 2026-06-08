import mongoose from 'mongoose';
import { logger } from './logger';

const MONGODB_URI = process.env.MONGODB_URI?.trim();
const LOCAL_MONGODB_URI = process.env.MONGODB_FALLBACK_URI?.trim();
const MONGODB_DB_NAME = process.env.MONGODB_DB_NAME?.trim() || 'omnipost_db';

export async function connectDB() {
  mongoose.set('strictQuery', false);

  const targetUri = MONGODB_URI || LOCAL_MONGODB_URI;
  if (!targetUri) {
    throw new Error('MONGODB_URI and MONGODB_FALLBACK_URI are not defined in .env');
  }

  try {
    await mongoose.connect(targetUri, {
      dbName: MONGODB_DB_NAME,
      autoIndex: true,
    });
    logger.info(`MongoDB connected — ${MONGODB_DB_NAME}`);
  } catch (err) {
    logger.error('Unable to connect to MongoDB. Please verify your connection settings in .env.', err);
    throw err;
  }
}

export async function disconnectDB() {
  await mongoose.connection.close();
}

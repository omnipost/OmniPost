import mongoose from 'mongoose';
import { logger } from './logger';

const MONGODB_URI = process.env.MONGODB_URI?.trim() || '';
const MONGODB_DB_NAME = process.env.MONGODB_DB_NAME?.trim() || 'omnipost_db';
const LOCAL_MONGODB_URI = process.env.MONGODB_FALLBACK_URI?.trim() || `mongodb://localhost:27017/${MONGODB_DB_NAME}?retryWrites=true&w=majority`;

function buildDirectUri(srvUri: string, dbName: string): string {
  const prefix = 'mongodb+srv://';
  if (!srvUri.startsWith(prefix)) return srvUri;

  const rest = srvUri.slice(prefix.length);
  const [credentialsAndHostAndPath, query] = rest.split('?');
  const [credentials, hostAndPath] = credentialsAndHostAndPath.includes('@')
    ? credentialsAndHostAndPath.split('@')
    : ['', credentialsAndHostAndPath];
  const [host, uriDbName] = hostAndPath.split('/');

  const hostParts = host.split('.');
  const clusterName = hostParts[0];
  const domain = hostParts.slice(1).join('.');
  const directHosts = [
    `${clusterName}-shard-00-00.${domain}:27017`,
    `${clusterName}-shard-00-01.${domain}:27017`,
    `${clusterName}-shard-00-02.${domain}:27017`,
  ].join(',');

  const authSection = credentials ? `${credentials}@` : '';
  const queryParams = new URLSearchParams(query || '');
  queryParams.set('tls', 'true');
  queryParams.set('retryWrites', 'true');
  queryParams.set('w', 'majority');
  queryParams.set('authSource', 'admin');

  const effectiveDbName = uriDbName && uriDbName !== '' ? uriDbName : dbName;
  return `mongodb://${authSection}${directHosts}/${effectiveDbName}?${queryParams.toString()}`;
}

async function connectToUri(uri: string) {
  await mongoose.connect(uri, {
    dbName: MONGODB_DB_NAME,
    autoIndex: true,
  });
}

export async function connectDB() {
  mongoose.set('strictQuery', false);

  if (!MONGODB_URI) {
    logger.warn('MONGODB_URI not set in .env — trying local MongoDB fallback.');
  }

  try {
    await connectToUri(MONGODB_URI || LOCAL_MONGODB_URI);
    logger.info(`MongoDB connected — ${MONGODB_DB_NAME}`);
    return;
  } catch (err) {
    logger.warn('MongoDB connection failed.', err);

    if (MONGODB_URI && MONGODB_URI.startsWith('mongodb+srv://')) {
      const directUri = buildDirectUri(MONGODB_URI, MONGODB_DB_NAME);
      try {
        await connectToUri(directUri);
        logger.info(`MongoDB connected via direct host fallback — ${MONGODB_DB_NAME}`);
        return;
      } catch (directErr) {
        logger.warn('MongoDB direct fallback connection failed.', directErr);
      }
    }

    if (MONGODB_URI) {
      try {
        await connectToUri(LOCAL_MONGODB_URI);
        logger.info(`MongoDB connected via local fallback — ${MONGODB_DB_NAME}`);
        return;
      } catch (localErr) {
        logger.warn('Local MongoDB fallback connection failed.', localErr);
      }
    }

    logger.error('Unable to connect to MongoDB. Please verify your connection settings.');
    throw err;
  }
}

export async function disconnectDB() {
  await mongoose.connection.close();
}

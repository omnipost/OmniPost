import { MongoClient, Db, ObjectId } from 'mongodb';
import bcrypt from 'bcryptjs';
import { logger } from './logger';

const DEFAULT_MONGODB_URI =
  'mongodb+srv://omnipost123_db_user:Chandu238@cluster0.nbfzvgk.mongodb.net/?appName=Cluster0';
const MONGODB_URI = process.env.MONGODB_URI || DEFAULT_MONGODB_URI;
const MONGODB_DB_NAME = process.env.MONGODB_DB_NAME || 'omnipost_db';
const LOCAL_MONGODB_URI = process.env.MONGODB_FALLBACK_URI || `mongodb://localhost:27017/${MONGODB_DB_NAME}?retryWrites=true&w=majority`;

export let mongoClient: MongoClient | null = null;
export let db: any = null;
let internalDb: Db | null = null;

// In-memory fallback database for development
let inMemoryDb: any = null;

function createInMemoryDb() {
  const collections: Record<string, any> = {};
  
  return {
    collection: (name: string) => {
      if (!collections[name]) {
        collections[name] = [];
      }
      
      return {
        findOne: async (query: any) => {
          const coll = collections[name];
          for (const doc of coll) {
            let matches = true;
            for (const [key, value] of Object.entries(query)) {
              if (doc[key] !== value) {
                matches = false;
                break;
              }
            }
            if (matches) return doc;
          }
          return null;
        },
        find: async (query: any) => ({
          toArray: async () => {
            const coll = collections[name];
            return coll.filter((doc: any) => {
              for (const [key, value] of Object.entries(query)) {
                if (doc[key] !== value) return false;
              }
              return true;
            });
          },
        }),
        insertOne: async (doc: any) => {
          const coll = collections[name];
          const newDoc = { _id: new ObjectId(), ...doc };
          coll.push(newDoc);
          return { insertedId: newDoc._id };
        },
        updateOne: async (query: any, update: any) => {
          const coll = collections[name];
          for (let i = 0; i < coll.length; i++) {
            let matches = true;
            for (const [key, value] of Object.entries(query)) {
              if (coll[i][key] !== value) {
                matches = false;
                break;
              }
            }
            if (matches) {
              coll[i] = { ...coll[i], ...update.$set };
              return { modifiedCount: 1 };
            }
          }
          return { modifiedCount: 0 };
        },
        deleteOne: async (query: any) => {
          const coll = collections[name];
          for (let i = 0; i < coll.length; i++) {
            let matches = true;
            for (const [key, value] of Object.entries(query)) {
              if (coll[i][key] !== value) {
                matches = false;
                break;
              }
            }
            if (matches) {
              coll.splice(i, 1);
              return { deletedCount: 1 };
            }
          }
          return { deletedCount: 0 };
        },
        createIndex: async () => { },
      };
    },
  };
}

export function getDb(): Db {
  if (internalDb) return internalDb;
  if (inMemoryDb) return inMemoryDb;
  throw new Error('Database is not connected');
}

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

async function createClient(uri: string) {
  return new MongoClient(uri, {
    serverApi: { version: '1' },
  });
}

export async function connectDB() {
  try {
    mongoClient = await createClient(MONGODB_URI);
    await mongoClient.connect();
    internalDb = mongoClient.db(MONGODB_DB_NAME);
  } catch (err) {
    logger.warn('MongoDB SRV connection failed, trying direct host fallback.');
    if (MONGODB_URI.startsWith('mongodb+srv://')) {
      const directUri = buildDirectUri(MONGODB_URI, MONGODB_DB_NAME);
      try {
        mongoClient = await createClient(directUri);
        await mongoClient.connect();
        internalDb = mongoClient.db(MONGODB_DB_NAME);
      } catch (directErr) {
        logger.warn('MongoDB direct fallback connection failed, trying local MongoDB fallback.');
        try {
          mongoClient = await createClient(LOCAL_MONGODB_URI);
          await mongoClient.connect();
          internalDb = mongoClient.db(MONGODB_DB_NAME);
        } catch (localErr) {
          logger.warn('❌ MongoDB connections failed. Using in-memory fallback for development.');
          inMemoryDb = createInMemoryDb();
          
          // Pre-seed demo user in memory
          const demoHash = await bcrypt.hash('Demo@123', 12);
          const demoUser = {
            _id: new ObjectId(),
            name: 'Priya Sharma',
            email: 'demo@omnipost.in',
            mobile: '+919876543210',
            passwordHash: demoHash,
            plan: 'creator',
            isVerified: true,
            createdAt: new Date(),
          };
          await inMemoryDb.collection('users').insertOne(demoUser);
          logger.info('✅ In-memory database initialized with demo user');
          return;
        }
      }
    } else {
      logger.warn('MongoDB connection failed, trying local MongoDB fallback.');
      try {
        mongoClient = await createClient(LOCAL_MONGODB_URI);
        await mongoClient.connect();
        internalDb = mongoClient.db(MONGODB_DB_NAME);
      } catch (localErr) {
        logger.warn('❌ MongoDB connections failed. Using in-memory fallback for development.');
        inMemoryDb = createInMemoryDb();
        
        // Pre-seed demo user in memory
        const demoHash = await bcrypt.hash('Demo@123', 12);
        const demoUser = {
          _id: new ObjectId(),
          name: 'Priya Sharma',
          email: 'demo@omnipost.in',
          mobile: '+919876543210',
          passwordHash: demoHash,
          plan: 'creator',
          isVerified: true,
          createdAt: new Date(),
        };
        await inMemoryDb.collection('users').insertOne(demoUser);
        logger.info('✅ In-memory database initialized with demo user');
        return;
      }
    }
  }

  if (internalDb) {
    db = internalDb;
    await internalDb.collection('users').createIndex({ email: 1 }, { unique: true, background: false }).catch(() => {});
    await internalDb.collection('users').createIndex({ mobile: 1 }, { unique: true, sparse: true, background: false }).catch(() => {});
    logger.info(`✅ MongoDB connected — ${MONGODB_DB_NAME}`);
  }
}

import { MongoClient, Db } from 'mongodb';

const uri: string = process.env.MONGODB_URI || '';
const options = {
  // Add connection timeout and retry options
  connectTimeoutMS: 10000,
  serverSelectionTimeoutMS: 10000,
  retryWrites: true,
};

let client: MongoClient | null = null;
let clientPromise: Promise<MongoClient> | null = null;

function getClientPromise(): Promise<MongoClient> | null {
  if (!uri) {
    return null;
  }

  if (process.env.NODE_ENV === 'development') {
    // In development mode, use a global variable so that the value
    // is preserved across module reloads caused by HMR (Hot Module Replacement).
    let globalWithMongo = global as typeof globalThis & {
      _mongoClientPromise?: Promise<MongoClient>;
    };

    if (!globalWithMongo._mongoClientPromise) {
      client = new MongoClient(uri, options);
      globalWithMongo._mongoClientPromise = client.connect().catch((err) => {
        console.error('MongoDB connection error:', err);
        throw err;
      });
    }
    return globalWithMongo._mongoClientPromise;
  } else {
    // In production mode, it's best to not use a global variable.
    if (!clientPromise) {
      client = new MongoClient(uri, options);
      clientPromise = client.connect().catch((err) => {
        console.error('MongoDB connection error:', err);
        throw err;
      });
    }
    return clientPromise;
  }
}

export async function getDatabase(): Promise<Db> {
  const promise = getClientPromise();
  if (!promise) {
    throw new Error('MONGODB_URI is not set');
  }
  
  try {
    const client = await promise;
    const dbName = process.env.MONGODB_DB_NAME || 'lms';
    return client.db(dbName);
  } catch (error) {
    console.error('Failed to get database:', error);
    throw error;
  }
}

export default getClientPromise();

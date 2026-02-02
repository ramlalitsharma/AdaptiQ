import { neon } from '@neondatabase/serverless';

export function getNeonDb() {
  const databaseUrl = process.env.NEON_DATABASE_URL || '';

  if (!databaseUrl) {
    console.warn('NEON_DATABASE_URL is not set. Course data operations will fail.');
  }
  return neon(databaseUrl);
}

import { getDatabase } from '@/lib/mongodb';

export async function getLatestKeywords(): Promise<string[]> {
  try {
    const db = await getDatabase();
    const col = db.collection('seo');
    const row = await col.find({}).sort({ createdAt: -1 }).limit(1).toArray();
    return (row[0]?.keywords as string[]) || [];
  } catch {
    return [];
  }
}



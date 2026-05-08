import { config } from 'dotenv';
config({ path: '../.env.local' });
import { getDatabase } from '../lib/mongodb';

async function listLatestBlogs() {
  console.log('--- Database Verification ---');
  try {
    const db = await getDatabase();
    const blogs = await db.collection('blogs')
      .find({})
      .sort({ createdAt: -1 })
      .limit(3)
      .toArray();
    
    if (blogs.length === 0) {
      console.log('No blogs found in database.');
    } else {
      blogs.forEach((b, i) => {
        console.log(`[${i+1}] Title: ${b.title}`);
        console.log(`    Slug: ${b.slug}`);
        console.log(`    Status: ${b.status}`);
        console.log(`    Created: ${b.createdAt}`);
        console.log('---');
      });
    }
    process.exit(0);
  } catch (e: any) {
    console.error('Database query failed:', e.message);
    process.exit(1);
  }
}

listLatestBlogs();

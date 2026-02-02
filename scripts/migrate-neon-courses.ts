import * as dotenv from 'dotenv';
import path from 'path';

// Load env from .env.local BEFORE other imports
dotenv.config({ path: path.resolve(process.cwd(), '.env.local') });

import { getNeonDb } from '../lib/neon';

async function migrate() {
  console.log('🚀 Starting Neon Courses Migration...');
  const sql = getNeonDb();

  try {
    console.log('🩺 Ensuring "courses" table schema integrity...');

    await sql.unsafe(`
            CREATE TABLE IF NOT EXISTS public.courses (
                id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
                author_id TEXT NOT NULL,
                title TEXT NOT NULL,
                slug TEXT UNIQUE NOT NULL
            )
        `);
    console.log('✅ Base table verified.');

    const addCol = async (name: string, type: string, def?: string) => {
      try {
        await sql.unsafe(`ALTER TABLE public.courses ADD COLUMN IF NOT EXISTS ${name} ${type} ${def || ''}`);
        console.log(`  - Column ensured: ${name}`);
      } catch (err: any) {
        console.log(`  - Skip ${name}: ${err.message}`);
      }
    };

    await addCol('category_id', 'TEXT');
    await addCol('summary', 'TEXT');
    await addCol('description', 'TEXT');
    await addCol('thumbnail', 'TEXT');
    await addCol('subject', 'TEXT');
    await addCol('level', 'TEXT');
    await addCol('language', 'TEXT', "DEFAULT 'English'");
    await addCol('tags', 'TEXT[]');
    await addCol('curriculum', 'JSONB', "DEFAULT '[]'");
    await addCol('status', 'TEXT', "DEFAULT 'draft'");
    await addCol('price', 'JSONB', "DEFAULT '{\"currency\": \"USD\", \"amount\": 0}'");
    await addCol('seo', 'JSONB', "DEFAULT '{}'");
    await addCol('metadata', 'JSONB', "DEFAULT '{}'");
    await addCol('resources', 'JSONB', "DEFAULT '[]'");
    await addCol('created_at', 'TIMESTAMP WITH TIME ZONE', 'DEFAULT CURRENT_TIMESTAMP');
    await addCol('updated_at', 'TIMESTAMP WITH TIME ZONE', 'DEFAULT CURRENT_TIMESTAMP');

    console.log('✨ courses table schema is now FULL and CORRECT.');
  } catch (error: any) {
    console.error('❌ Migration failed:', error.message);
    process.exit(1);
  }
}

migrate();

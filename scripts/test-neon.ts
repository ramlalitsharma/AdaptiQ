import { getNeonDb } from '../lib/neon';
import * as dotenv from 'dotenv';
import path from 'path';

// Load env from .env.local
dotenv.config({ path: path.resolve(process.cwd(), '.env.local') });

async function main() {
  try {
    const sql = getNeonDb();
    console.log('🔗 Atomic Migrator Active...');

    const runForceMigration = async () => {
      console.log('🏗️ Step 1: Creating "courses_v2" with full schema...');
      await sql.unsafe(`
            DROP TABLE IF EXISTS public.courses_v2 CASCADE;
            CREATE TABLE public.courses_v2 (
                id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
                author_id TEXT NOT NULL,
                category_id TEXT,
                title TEXT NOT NULL,
                slug TEXT UNIQUE NOT NULL,
                summary TEXT,
                description TEXT,
                thumbnail TEXT,
                subject TEXT,
                level TEXT,
                language TEXT DEFAULT 'English',
                tags TEXT[],
                curriculum JSONB DEFAULT '[]',
                status TEXT DEFAULT 'draft',
                price JSONB DEFAULT '{"currency": "USD", "amount": 0}',
                seo JSONB DEFAULT '{}',
                metadata JSONB DEFAULT '{}',
                resources JSONB DEFAULT '[]',
                created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
                updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
            );
        `);
      console.log('✅ Created courses_v2.');

      console.log('🔍 Step 2: Verifying courses_v2 columns...');
      const cols = await sql`SELECT column_name FROM information_schema.columns WHERE table_name = 'courses_v2'`;
      console.log('   - Columns:', cols.map(c => c.column_name).join(', '));

      if (cols.some(c => c.column_name === 'thumbnail')) {
        console.log('🚀 Step 3: Swapping tables...');
        await sql.unsafe(`
                DROP TABLE IF EXISTS public.courses CASCADE;
                ALTER TABLE public.courses_v2 RENAME TO courses;
                CREATE INDEX IF NOT EXISTS idx_courses_slug ON public.courses(slug);
            `);
        console.log('🎉 SWAP SUCCESSFUL.');
      } else {
        console.error('❌ FAILED TO CREATE V2 WITH THUMBNAIL.');
      }
    };

    await runForceMigration();

    console.log('🔍 Final Verification on "courses":');
    try {
      const check = await sql`SELECT thumbnail FROM public.courses LIMIT 0`;
      console.log('✅ PLATFORM ENGINE RESTORED. SCHEMA PERSISTENT.');
    } catch (e: any) {
      console.error('❌ FATAL SCHEMA ERROR:', e.message);
    }
  } catch (error: any) {
    console.error('❌ Neon Test Failed:');
    console.error('Code:', error.code);
    console.error('Message:', error.message);
    console.error('Hint:', error.hint);
  }
}

main();

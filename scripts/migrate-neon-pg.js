/* eslint-disable */
const { Client } = require('pg');
const dotenv = require('dotenv');
const path = require('path');

// Load env
dotenv.config({ path: path.resolve(process.cwd(), '.env.local') });

async function migrate() {
    const connectionString = process.env.NEON_DATABASE_URL;
    if (!connectionString) {
        console.error('NEON_DATABASE_URL not found');
        process.exit(1);
    }

    const client = new Client({
        connectionString,
        ssl: { rejectUnauthorized: false }
    });

    try {
        console.log('🔗 Connecting via TCP (pg)...');
        await client.connect();
        console.log('✅ Connected.');

        console.log('🏗️ Rebuilding courses table schema...');
        await client.query('DROP TABLE IF EXISTS public.courses CASCADE');

        await client.query(`
            CREATE TABLE public.courses (
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
            )
        `);
        console.log('✅ Created public.courses with ALL columns.');

        await client.query('CREATE INDEX IF NOT EXISTS idx_courses_slug ON public.courses(slug)');

        console.log('🔍 Verification query...');
        const result = await client.query('SELECT column_name FROM information_schema.columns WHERE table_name = \'courses\'');
        const cols = result.rows.map(r => r.column_name);
        console.log('✅ Columns verified in DB:', cols.join(', '));

        if (cols.includes('thumbnail')) {
            console.log('🚀 SCHEMA PERSISTENCE CONFIRMED.');
        } else {
            console.error('❌ STILL MISSING THUMBNAIL IN PG DRIVER!');
        }

    } catch (err) {
        console.error('❌ PG Migration Failed:', err.message);
    } finally {
        await client.end();
    }
}

migrate();

import { NextResponse } from 'next/server';
import { getDatabase } from '@/lib/mongodb';

export const dynamic = 'force-dynamic';

export async function GET() {
    try {
        const db = await getDatabase();
        const posts = await db
            .collection('blogs')
            .find({ status: 'published' })
            .sort({ createdAt: -1 })
            .limit(50)
            .toArray();

        return NextResponse.json({ posts });
    } catch (error: any) {
        console.error('Public blog fetch error:', error);
        return NextResponse.json({ error: 'Failed to fetch blogs', message: error.message }, { status: 500 });
    }
}

import { NextRequest, NextResponse } from 'next/server';
import { getDatabase } from '@/lib/mongodb';

export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest, { params }: { params: Promise<{ slug: string }> }) {
    try {
        const { slug } = await params;
        const db = await getDatabase();
        const post = await db.collection('blogs').findOne({ slug, status: 'published' });

        if (!post) {
            return NextResponse.json({ error: 'Post not found' }, { status: 404 });
        }

        return NextResponse.json({ post });
    } catch (error: any) {
        console.error('Public blog post fetch error:', error);
        return NextResponse.json({ error: 'Failed to fetch blog post', message: error.message }, { status: 500 });
    }
}

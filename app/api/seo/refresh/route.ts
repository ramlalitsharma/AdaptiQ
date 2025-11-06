import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { getDatabase } from '@/lib/mongodb';

// Store trending keywords to drive dynamic metadata
export async function POST(req: NextRequest) {
  try {
    const { userId } = await auth();
    if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const body = await req.json().catch(() => ({}));
    const { keywords } = body;
    if (!Array.isArray(keywords) || keywords.length === 0) {
      return NextResponse.json({ error: 'keywords array required' }, { status: 400 });
    }

    const db = await getDatabase();
    const seo = db.collection('seo');
    await seo.insertOne({ keywords, createdAt: new Date() });
    return NextResponse.json({ ok: true });
  } catch (e: any) {
    return NextResponse.json({ error: 'Failed', message: e.message }, { status: 500 });
  }
}



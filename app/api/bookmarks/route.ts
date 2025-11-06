import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { getDatabase } from '@/lib/mongodb';

export const runtime = 'nodejs';

export async function GET(req: NextRequest) {
  try {
    const { userId } = await auth();
    if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const db = await getDatabase();
    const bookmarks = await db.collection('bookmarks').find({ userId }).sort({ createdAt: -1 }).toArray();

    return NextResponse.json(bookmarks);
  } catch (e: any) {
    return NextResponse.json({ error: 'Failed to fetch bookmarks', message: e.message }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const { userId } = await auth();
    if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const body = await req.json();
    const { courseId, courseSlug, courseTitle, type = 'course' } = body;

    if (!courseId && !courseSlug) {
      return NextResponse.json({ error: 'courseId or courseSlug required' }, { status: 400 });
    }

    const db = await getDatabase();
    const bookmarks = db.collection('bookmarks');

    const existing = await bookmarks.findOne({ userId, courseId: courseId || courseSlug });
    if (existing) {
      await bookmarks.deleteOne({ _id: existing._id });
      return NextResponse.json({ bookmarked: false });
    }

    await bookmarks.insertOne({
      userId,
      courseId: courseId || courseSlug,
      courseTitle: courseTitle || 'Untitled',
      type,
      createdAt: new Date(),
    });

    return NextResponse.json({ bookmarked: true });
  } catch (e: any) {
    return NextResponse.json({ error: 'Failed to toggle bookmark', message: e.message }, { status: 500 });
  }
}


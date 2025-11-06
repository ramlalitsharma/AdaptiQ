import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { getDatabase } from '@/lib/mongodb';

export const runtime = 'nodejs';

export async function GET(req: NextRequest, { params }: { params: Promise<{ slug: string }> }) {
  try {
    const { slug } = await params;
    const db = await getDatabase();
    const reviews = await db.collection('reviews').find({ courseSlug: slug }).sort({ createdAt: -1 }).limit(50).toArray();
    
    const stats = reviews.reduce((acc: any, r: any) => {
      acc.total += 1;
      acc.sum += r.rating || 0;
      acc.byRating[r.rating] = (acc.byRating[r.rating] || 0) + 1;
      return acc;
    }, { total: 0, sum: 0, byRating: { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 } });

    return NextResponse.json({ reviews, stats: { ...stats, average: stats.total > 0 ? (stats.sum / stats.total).toFixed(1) : '0' } });
  } catch (e: any) {
    return NextResponse.json({ error: 'Failed to fetch reviews', message: e.message }, { status: 500 });
  }
}

export async function POST(req: NextRequest, { params }: { params: Promise<{ slug: string }> }) {
  try {
    const { userId } = await auth();
    if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const { slug } = await params;
    const body = await req.json();
    const { rating, comment } = body;

    if (!rating || rating < 1 || rating > 5) {
      return NextResponse.json({ error: 'Rating must be between 1 and 5' }, { status: 400 });
    }

    const db = await getDatabase();
    const reviews = db.collection('reviews');
    const user = await db.collection('users').findOne({ $or: [{ clerkId: userId }, { _id: userId }] });

    // Check if user already reviewed
    const existing = await reviews.findOne({ userId, courseSlug: slug });
    if (existing) {
      await reviews.updateOne({ _id: existing._id }, {
        $set: { rating, comment, updatedAt: new Date() }
      });
      return NextResponse.json({ success: true, updated: true });
    }

    await reviews.insertOne({
      userId,
      userName: user?.name || 'Anonymous',
      courseSlug: slug,
      rating,
      comment: comment || '',
      createdAt: new Date(),
      updatedAt: new Date(),
    });

    return NextResponse.json({ success: true });
  } catch (e: any) {
    return NextResponse.json({ error: 'Failed to submit review', message: e.message }, { status: 500 });
  }
}


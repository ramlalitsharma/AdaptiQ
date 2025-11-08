import { NextRequest, NextResponse } from 'next/server';
import { getDatabase } from '@/lib/mongodb';
import { auth, currentUser } from '@/lib/auth';
import { ObjectId } from 'mongodb';

export const runtime = 'nodejs';

const APPROVED_QUERY = {
  $or: [{ status: 'approved' }, { status: { $exists: false } }],
};

export async function GET(req: NextRequest, { params }: { params: Promise<{ slug: string }> }) {
  try {
    const { slug } = await params;
    const db = await getDatabase();

    const reviewsCollection = db.collection('reviews');
    const reviews = await reviewsCollection
      .find({ courseSlug: slug, ...APPROVED_QUERY })
      .sort({ createdAt: -1 })
      .limit(50)
      .toArray();

    const statsAgg = await reviewsCollection
      .aggregate([
        { $match: { courseSlug: slug, ...APPROVED_QUERY } },
        {
          $group: {
            _id: '$courseSlug',
            total: { $sum: 1 },
            sum: { $sum: '$rating' },
          },
        },
      ])
      .toArray();

    const statsRecord = statsAgg[0] || { total: 0, sum: 0 };

    return NextResponse.json({
      reviews: reviews.map((review: any) => ({
        ...review,
        userName: review.userName || 'Learner',
      })),
      stats: {
        total: statsRecord.total,
        sum: statsRecord.sum,
        average: statsRecord.total > 0 ? (statsRecord.sum / statsRecord.total).toFixed(1) : '0',
      },
    });
  } catch (e: any) {
    console.error('Fetch reviews error:', e);
    return NextResponse.json({ error: 'Failed to fetch reviews', message: e.message }, { status: 500 });
  }
}

export async function POST(req: NextRequest, { params }: { params: Promise<{ slug: string }> }) {
  try {
    const { userId } = await auth();
    if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const { slug } = await params;
    const { rating, comment } = await req.json();

    if (!rating || rating < 1 || rating > 5) {
      return NextResponse.json({ error: 'Rating must be between 1 and 5' }, { status: 400 });
    }

    const user = await currentUser();
    const displayName =
      user?.fullName || user?.username || user?.emailAddresses?.[0]?.emailAddress || 'Learner';

    const db = await getDatabase();
    const reviews = db.collection('reviews');
    const now = new Date();

    const baseDoc = {
      courseSlug: slug,
      userId,
      userName: displayName,
      rating,
      comment: comment || '',
      status: 'pending',
      createdAt: now,
      updatedAt: now,
    };

    const existing = await reviews.findOne({ userId, courseSlug: slug });
    if (existing) {
      await reviews.updateOne(
        { _id: new ObjectId(existing._id) },
        {
          $set: {
            ...baseDoc,
            createdAt: existing.createdAt || now,
            status: 'pending',
          },
        },
      );
    } else {
      await reviews.insertOne(baseDoc);
    }

    return NextResponse.json({ success: true, pending: true, message: 'Review submitted for moderation.' });
  } catch (e: any) {
    console.error('Create review error:', e);
    return NextResponse.json({ error: 'Failed to submit review', message: e.message }, { status: 500 });
  }
}


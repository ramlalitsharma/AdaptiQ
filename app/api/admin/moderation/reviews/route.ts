import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { requireAdmin } from '@/lib/admin-check';
import { getDatabase } from '@/lib/mongodb';
import { serializeReview } from '@/lib/models/Review';

export const runtime = 'nodejs';

export async function GET(req: NextRequest) {
  try {
    const { userId } = await auth();
    if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    await requireAdmin();

    const { searchParams } = new URL(req.url);
    const statusParam = searchParams.get('status') || 'pending';
    const limit = parseInt(searchParams.get('limit') || '50', 10);

    const matchStage: Record<string, any> = {};
    if (statusParam !== 'all') {
      matchStage.status = statusParam;
    } else {
      matchStage.status = { $ne: 'approved' };
    }

    const db = await getDatabase();
    const reviews = await db
      .collection('reviews')
      .aggregate([
        { $match: matchStage },
        { $sort: { createdAt: -1 } },
        { $limit: limit },
        {
          $lookup: {
            from: 'users',
            let: { reviewUserId: '$userId' },
            pipeline: [
              {
                $match: {
                  $expr: {
                    $or: [
                      { $eq: ['$clerkId', '$$reviewUserId'] },
                      {
                        $and: [
                          { $ifNull: ['$_id', false] },
                          {
                            $eq: [
                              { $toString: '$_id' },
                              '$$reviewUserId',
                            ],
                          },
                        ],
                      },
                    ],
                  },
                },
              },
              { $project: { name: 1, email: 1 } },
            ],
            as: 'user',
          },
        },
        {
          $addFields: {
            userName: {
              $cond: [
                { $gt: [{ $size: '$user' }, 0] },
                { $ifNull: [{ $first: '$user.name' }, { $first: '$user.email' }] },
                '$userId',
              ],
            },
          },
        },
        { $project: { user: 0 } },
      ])
      .toArray();

    return NextResponse.json({
      reviews: reviews.map((review: any) => ({
        ...serializeReview(review),
        userName: review.userName,
      })),
    });
  } catch (error: any) {
    console.error('Moderation reviews fetch error:', error);
    return NextResponse.json({ error: 'Failed to load reviews', message: error.message }, { status: 500 });
  }
}

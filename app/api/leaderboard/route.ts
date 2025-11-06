import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { getDatabase } from '@/lib/mongodb';

export async function GET(req: NextRequest) {
  try {
    // Leaderboard is public to authenticated users
    const { userId } = await auth();
    if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const db = await getDatabase();
    const col = db.collection('userProgress');

    // Aggregate average score and quizzes taken by user
    const agg = await col.aggregate([
      { $group: { _id: '$userId', quizzes: { $sum: 1 }, avgScore: { $avg: '$score' } } },
      { $sort: { avgScore: -1, quizzes: -1 } },
      { $limit: 10 },
    ]).toArray();

    // Get user names from a users collection if available
    const usersCol = db.collection('users');
    const entries = await Promise.all(
      agg.map(async (r: any, idx: number) => {
        const u = await usersCol.findOne({ clerkId: r._id });
        return {
          rank: idx + 1,
          name: u?.name || 'User',
          score: Math.round(r.avgScore || 0),
          quizzes: r.quizzes || 0,
          streak: u?.streak || 0,
        };
      })
    );

    return NextResponse.json(entries);
  } catch (error: any) {
    console.error('Error fetching leaderboard:', error);
    return NextResponse.json({ error: 'Failed to fetch leaderboard', message: error.message }, { status: 500 });
  }
}



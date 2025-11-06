import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { getDatabase } from '@/lib/mongodb';
import { UserProgress } from '@/lib/models/User';

export async function GET(req: NextRequest) {
  try {
    const { userId } = await auth();
    
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const db = await getDatabase();
    const progressCollection = db.collection<UserProgress>('userProgress');
    
    const progress = await progressCollection
      .find({ userId })
      .sort({ completedAt: -1 })
      .limit(50)
      .toArray();

    return NextResponse.json(progress);
  } catch (error: any) {
    console.error('Error fetching progress:', error);
    return NextResponse.json(
      { error: 'Failed to fetch progress', message: error.message },
      { status: 500 }
    );
  }
}

export async function POST(req: NextRequest) {
  try {
    const { userId } = await auth();
    
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await req.json();
    const progress: Omit<UserProgress, 'userId'> = body;

    const db = await getDatabase();
    const progressCollection = db.collection<UserProgress>('userProgress');
    
    // Insert progress
    await progressCollection.insertOne({
      ...progress,
      userId,
      completedAt: new Date(),
    } as UserProgress);

    // Update user's overall stats
    const usersCollection = db.collection('users');
    const user = await usersCollection.findOne({ clerkId: userId });
    
    if (user) {
      const newTotalQuizzes = (user.learningProgress?.totalQuizzesTaken || 0) + 1;
      const currentAvg = user.learningProgress?.averageScore || 0;
      const newAvg = ((currentAvg * (newTotalQuizzes - 1)) + progress.score) / newTotalQuizzes;

      await usersCollection.updateOne(
        { clerkId: userId },
        {
          $set: {
            'learningProgress.totalQuizzesTaken': newTotalQuizzes,
            'learningProgress.averageScore': newAvg,
            'learningProgress.knowledgeGaps': progress.knowledgeGapsIdentified,
            updatedAt: new Date(),
          },
          $inc: {
            // optional hook point for streaks, etc.
          },
        }
      );
    }

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error('Error saving progress:', error);
    return NextResponse.json(
      { error: 'Failed to save progress', message: error.message },
      { status: 500 }
    );
  }
}
